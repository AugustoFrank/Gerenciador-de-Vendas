import os
from decimal import Decimal
import random
from datetime import datetime, time, timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import update_session_auth_hash, authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
import json
from django.db.models.functions import TruncDate
from django.db.models import Sum, Q, Avg, Count, F
from django.db import transaction
from django.utils import timezone
from django.utils.timezone import make_aware
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Perfil, Produto, Venda, HistoricoPreco
from django.core.exceptions import ValidationError # 🟢 ADICIONADO PARA O TRATAMENTO DE ERRO

def eh_admin(user):
    return user.is_authenticated and hasattr(user, 'perfil') and user.perfil.cargo == 'administrador'

def custom_login(request):
    if request.method == 'POST':
        id_para_logar = request.POST.get('matricula_digitada')
        senha_digitada = request.POST.get('password')

        if id_para_logar and senha_digitada:
            try:
                perfil = Perfil.objects.get(matricula=id_para_logar)
                username_do_banco = perfil.usuario.username
            except Perfil.DoesNotExist:
                username_do_banco = id_para_logar

            user = authenticate(request, username=username_do_banco, password=senha_digitada)
            
            if user is not None:
                auth_login(request, user)
                from django.middleware.csrf import rotate_token
                rotate_token(request)
                return redirect('redirecionamento_login')
            else:
                messages.error(request, 'ID ou Senha incorretos.')
        else:
            messages.error(request, 'Por favor, preencha todos os campos.')

    return render(request, 'loja/login.html')

def custom_logout(request):
    auth_logout(request)
    return redirect('login')




@login_required
def redirecionamento_login(request):
    if hasattr(request.user, 'perfil') and request.user.perfil.cargo == 'administrador':
        return redirect('visao_geral_admin')
    return redirect('nova_venda')

@login_required
def visao_geral(request):
    # LOGICA CORRIGIDA: Range de tempo para evitar erro de fuso horário
    hoje = timezone.now().date()
    inicio_dia = make_aware(datetime.combine(hoje, time.min))
    fim_dia = make_aware(datetime.combine(hoje, time.max))

    vendas_usuario = Venda.objects.filter(data_venda__range=(inicio_dia, fim_dia), vendedor=request.user, cancelada=False)
    alertas = Produto.objects.filter(estoque__lt=10)
    
    ranking_vendedores = Venda.objects.filter(data_venda__range=(inicio_dia, fim_dia), cancelada=False).values(
        'vendedor__first_name', 
        'vendedor__username', 
        'vendedor__perfil__foto'
    ).annotate(total_vendas=Sum('preco_total')).order_by('-total_vendas')[:3]

    context = {
        'qtd_vendas': vendas_usuario.count(),
        'total_faturado': vendas_usuario.aggregate(Sum('preco_total'))['preco_total__sum'] or 0,
        'total_comissoes': vendas_usuario.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0,
        'alertas_estoque': alertas,
        'ranking': ranking_vendedores
    }
    return render(request, 'loja/usuario/visao_geral.html', context)

@login_required
def nova_venda(request):
    return render(request, 'loja/usuario/nova-venda.html')

@login_required
def estoque(request):
    estoque_vendedor = Produto.objects.filter(estoque__gt=0).order_by('nome')
    total_itens = estoque_vendedor.aggregate(Sum('estoque'))['estoque__sum'] or 0
    context = {
        'estoque_vendedor': estoque_vendedor, 
        'total_itens': total_itens,
        'qtd_produtos': estoque_vendedor.count(),
    }
    return render(request, 'loja/usuario/estoque_vendedor.html', context)

@login_required
def comissoes(request):
    vendas = Venda.objects.filter(vendedor=request.user, cancelada=False).order_by('-data_venda')
    context = {
        'vendas': vendas,
        'total_comissoes': vendas.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0,
    }
    return render(request, 'loja/usuario/minhas_comissoes.html', context)

@user_passes_test(eh_admin)
def visao_geral_admin(request):
    """Dashboard com ranking de produtos e cards de faturamento"""
    data_inicio_str = request.GET.get('data_inicio')
    data_fim_str = request.GET.get('data_fim')

    hoje = timezone.now().date()
    inicio_dia = make_aware(datetime.combine(hoje, time.min))
    fim_dia = make_aware(datetime.combine(hoje, time.max))
    periodo_label = "Hoje"

    if data_inicio_str and data_fim_str:
        inicio_dia = make_aware(datetime.strptime(data_inicio_str, '%Y-%m-%d'))
        fim_dia = make_aware(datetime.combine(datetime.strptime(data_fim_str, '%Y-%m-%d'), time.max))
        periodo_label = f"{inicio_dia.strftime('%d/%m')} a {fim_dia.strftime('%d/%m')}"

    vendas_periodo = Venda.objects.filter(data_venda__range=(inicio_dia, fim_dia), cancelada=False)

    # Ranking de Produtos (Agrupado por nome conforme solicitado)
    ranking_produtos = vendas_periodo.values(
        'produto__nome'
    ).annotate(
        total_faturado=Sum('preco_total'),
        qtd_total=Sum('quantidade_vendida')
    ).order_by('-total_faturado')[:5]

    # Métricas dos Cards: Faturamento Total, Varejo e Atacado
    total_faturado = vendas_periodo.aggregate(Sum('preco_total'))['preco_total__sum'] or 0
    total_varejo = vendas_periodo.filter(tipo_venda='varejo').aggregate(Sum('preco_total'))['preco_total__sum'] or 0
    total_atacado = vendas_periodo.filter(tipo_venda='atacado').aggregate(Sum('preco_total'))['preco_total__sum'] or 0

    context = {
        'total_faturado': total_faturado,
        'total_varejo': total_varejo,
        'total_atacado': total_atacado,
        'ranking': ranking_produtos,
        'periodo_label': periodo_label,
        'data_inicio_str': data_inicio_str,
        'data_fim_str': data_fim_str,
        'alertas_estoque': Produto.objects.filter(estoque__lt=10),
    }
    return render(request, 'loja/admin/visao_geral.html', context)

@user_passes_test(eh_admin)
def admin_equipe(request):
    # 🟢 ADICIONADO: O filtro usuario__is_active=True garante que os "excluídos" não apareçam aqui
    equipe = Perfil.objects.filter(
        usuario__is_active=True 
    ).select_related('usuario').annotate(
        total_vendas=Count('usuario__venda')
    ).order_by('-total_vendas') 
    
    return render(request, 'loja/admin/equipe.html', {'equipe': equipe})

@user_passes_test(eh_admin)
def admin_estoque(request):
    # FORÇA A LIMPEZA DAS MENSAGENS ANTIGAS
    storage = messages.get_messages(request)
    for _ in storage: pass 
    storage.used = True

    produtos_loja = Produto.objects.all().order_by('nome')
    vendedores = User.objects.filter(perfil__cargo='vendedor').select_related('perfil')
    return render(request, 'loja/admin/estoque.html', {'produtos_loja': produtos_loja, 'vendedores': vendedores})

@user_passes_test(eh_admin)
@transaction.atomic
def adicionar_estoque_admin(request):
    if request.method == 'POST':
        sku = request.POST.get('sku')
        quantidade_entrada = int(request.POST.get('quantidade') or 0)
        
        def clean_decimal(key):
            val = str(request.POST.get(key, '0') or '0').replace(',', '.').strip()
            return Decimal(val if val else '0')

        # Busca ou cria já com os valores do formulário
        produto, criado = Produto.objects.get_or_create(
            referencia=sku,
            defaults={
                'nome': request.POST.get('nome', ''),
                'valor_compra': clean_decimal('valor_compra'),
                'perc_imposto': clean_decimal('perc_imposto'),
                'perc_varejo': clean_decimal('perc_varejo'),
                'perc_atacado': clean_decimal('perc_atacado'),
                'em_promocao': request.POST.get('em_promocao') in ('true', 'on'),
            }
        )

        # Se já existia, atualiza os campos
        if not criado:
            produto.nome = request.POST.get('nome', produto.nome)
            produto.valor_compra = clean_decimal('valor_compra')
            produto.perc_imposto = clean_decimal('perc_imposto')
            produto.perc_varejo = clean_decimal('perc_varejo')
            produto.perc_atacado = clean_decimal('perc_atacado')
        produto.em_promocao = request.POST.get('em_promocao') in ('true', 'on')

        produto.estoque += quantidade_entrada
        produto.save()

        HistoricoPreco.objects.create(
            produto=produto,
            valor_compra=produto.valor_compra,
            perc_imposto=produto.perc_imposto,
            perc_varejo=produto.perc_varejo,
            perc_atacado=produto.perc_atacado,
            quantidade_adicionada=quantidade_entrada,
            estoque_final=produto.estoque
        )
        messages.success(request, f'Estoque e Histórico de {produto.nome} atualizados!')
    
    return redirect('admin_estoque')

@user_passes_test(eh_admin)
def relatorio_admin(request):
    vendas = Venda.objects.filter(cancelada=False).order_by('-data_venda')
    
    data_inicio_str = request.GET.get('data_inicio')
    data_fim_str = request.GET.get('data_fim')

    if data_inicio_str and data_fim_str:
        inicio_dia = make_aware(datetime.strptime(data_inicio_str, '%Y-%m-%d'))
        fim_dia = make_aware(datetime.combine(datetime.strptime(data_fim_str, '%Y-%m-%d'), time.max))
        vendas = vendas.filter(data_venda__range=(inicio_dia, fim_dia))

    context = {
        'total_faturado': vendas.aggregate(Sum('preco_total'))['preco_total__sum'] or 0,
        'total_comissoes': vendas.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0,
        'qtd_vendas': vendas.count(),
        'ticket_medio': vendas.aggregate(Avg('preco_total'))['preco_total__avg'] or 0,
        'comissoes': vendas,
    }
    return render(request, 'loja/admin/relatorios/relatorioFaturamento.html', context)

@user_passes_test(eh_admin)
def add_colaborador(request):
    if request.method == 'POST':
        username_id = request.POST.get('username')
        senha = request.POST.get('senha')
        nome = request.POST.get('nome_completo')
        
        if User.objects.filter(username=username_id).exists():
            messages.error(request, 'Este ID já existe.')
            return redirect('admin_equipe')
            
        novo_usuario = User.objects.create_user(username=username_id, password=senha, first_name=nome)
        
        comissao_str = str(request.POST.get('comissao', '0')).replace(',', '.')
        if not comissao_str.strip(): comissao_str = '0'

        # LÓGICA CORRIGIDA: Renomear foto para não exceder limites
        foto_enviada = request.FILES.get('foto_perfil')
        if foto_enviada:
            extensao = os.path.splitext(foto_enviada.name)[1]
            foto_enviada.name = f"{username_id}{extensao}"

        endereco_enviado = request.POST.get('endereco')
        telefone_enviado = request.POST.get('telefone')
        data_nasc_enviada = request.POST.get('data_nascimento')
        if not data_nasc_enviada: 
            data_nasc_enviada = None

        Perfil.objects.create(
            usuario=novo_usuario,
            cargo=request.POST.get('nivel'),
            comissao=Decimal(comissao_str),
            matricula=username_id,
            foto=foto_enviada,
            endereco=endereco_enviado,
            telefone=telefone_enviado,
            data_nascimento=data_nasc_enviada
        )
        messages.success(request, f'Colaborador cadastrado!')
    return redirect('admin_equipe')

@user_passes_test(eh_admin)
def editar_colaborador(request):
    if request.method == 'POST':
        username_id = request.POST.get('username_edit')
        try:
            user = User.objects.get(username=username_id)
            perfil = user.perfil
            user.first_name = request.POST.get('nome_completo')
            
            nova_senha = request.POST.get('nova_senha')
            if nova_senha and nova_senha.strip():
                user.set_password(nova_senha)
            user.save()
            
            perfil.cargo = request.POST.get('nivel')
            comissao_str = str(request.POST.get('comissao', '0')).replace(',', '.')
            if not comissao_str.strip(): comissao_str = '0'
            perfil.comissao = Decimal(comissao_str)

            # LÓGICA CORRIGIDA: Renomear foto na edição também
            if request.FILES.get('foto_perfil'):
                foto_enviada = request.FILES.get('foto_perfil')
                
                # Pegamos apenas a extensão (ex: .jpg ou .png)
                extensao = os.path.splitext(foto_enviada.name)[1]
                
                # Definimos um nome fixo e curto baseado no username
                # Isso impede que o Django tente criar nomes gigantescos
                foto_enviada.name = f"{username_id}{extensao}"
                
                perfil.foto = foto_enviada
                
            cor_enviada = request.POST.get('cor_banner_edit')
            if cor_enviada:
                perfil.cor_banner = cor_enviada
                
            perfil.endereco = request.POST.get('endereco')
            
            data_nasc_edit = request.POST.get('data_nascimento_edit')
            if data_nasc_edit:
                perfil.data_nascimento = data_nasc_edit
            
            perfil.save()
            messages.success(request, f'Dados atualizados!')
        except User.DoesNotExist:
            messages.error(request, 'Erro.')
    return redirect('admin_equipe')

def buscar_produto_ajax(request):
    termo = request.GET.get('referencia', '').strip()
    if termo:
        produtos = Produto.objects.filter(Q(referencia__icontains=termo) | Q(nome__icontains=termo))[:10]
        lista = [{
            'referencia': p.referencia, 
            'nome': p.nome, 
            'preco_varejo': float(p.valor_venda_varejo or 0), 
            'preco_atacado': float(p.valor_venda_atacado or 0), 
            'estoque': p.estoque
        } for p in produtos]
        return JsonResponse({'sucesso': True, 'produtos': lista})
    return JsonResponse({'sucesso': False})

def consulta_estoque_venda(request):
    referencia = request.GET.get('referencia')
    try:
        p = Produto.objects.get(referencia=referencia)
        return JsonResponse({
            'success': True, 
            'estoque': p.estoque, 
            'preco_varejo': str(p.valor_venda_varejo), 
            'preco_atacado': str(p.valor_venda_atacado),
            'nome': p.nome,
            'em_promocao': p.em_promocao
        })
    except Produto.DoesNotExist:
        return JsonResponse({'success': False})

def buscar_usuario_por_id(request):
    id_digitado = request.GET.get('id')
    try:
        perfil = Perfil.objects.select_related('usuario').get(matricula=id_digitado)
        return JsonResponse({'sucesso': True, 'nome': perfil.usuario.first_name or perfil.usuario.username})
    except Perfil.DoesNotExist:
        return JsonResponse({'sucesso': False})
    
@login_required
@transaction.atomic
def finalizar_venda(request):
    if request.method == 'POST':
        referencia = request.POST.get('referencia')
        quantidade = int(request.POST.get('quantidade') or 0)
        tipo = request.POST.get('tipo_venda')
        pagamento = request.POST.get('forma_pagamento')
        bandeira = request.POST.get('bandeira_cartao') or None

        try:
            produto = Produto.objects.get(referencia=referencia)

            Venda.objects.create(
                vendedor=request.user,
                produto=produto,
                quantidade_vendida=quantidade,
                tipo_venda=tipo,
                forma_pagamento=pagamento,
                bandeira_cartao=bandeira
            )

            messages.success(request, f'Venda de {produto.nome} finalizada com sucesso!')
        except Produto.DoesNotExist:
            messages.error(request, 'Produto não encontrado.')
        except ValidationError as e:
            messages.error(request, str(e))
        except Exception as e:
            messages.error(request, str(e))

    return redirect('nova_venda')

@login_required
@transaction.atomic
def finalizar_carrinho(request):
    if request.method == 'POST':
        import json
        try:
            payload = json.loads(request.body)
            itens = payload.get('itens', [])
            if not itens:
                return JsonResponse({'sucesso': False, 'erro': 'Carrinho vazio.'})
 
            vendas_criadas = []
            for item in itens:
                referencia    = item.get('referencia')
                quantidade    = int(item.get('quantidade', 1))
                tipo          = item.get('tipo_venda', 'varejo')
                pagamento     = item.get('forma_pagamento', 'dinheiro')
                bandeira      = item.get('bandeira_cartao') or None
                em_promocao   = bool(item.get('em_promocao', False))
 
                # Valores fracionados para pagamento composto
                v_credito  = Decimal(str(item.get('valor_credito',  0) or 0))
                v_debito   = Decimal(str(item.get('valor_debito',   0) or 0))
                v_pix      = Decimal(str(item.get('valor_pix',      0) or 0))
                v_dinheiro = Decimal(str(item.get('valor_dinheiro', 0) or 0))
 
                produto = Produto.objects.get(referencia=referencia)
 
                venda = Venda(
                    vendedor=request.user,
                    produto=produto,
                    quantidade_vendida=quantidade,
                    tipo_venda=tipo,
                    forma_pagamento=pagamento,
                    bandeira_cartao=bandeira,
                    em_promocao=em_promocao,
                    valor_credito=v_credito,
                    valor_debito=v_debito,
                    valor_pix=v_pix,
                    valor_dinheiro=v_dinheiro,
                )
                venda.save()
                vendas_criadas.append({
                    'nome': produto.nome,
                    'quantidade': quantidade,
                    'preco_total': float(venda.preco_total),
                    'forma_pagamento': venda.get_forma_pagamento_display(),
                    'desconto': float(venda.desconto_aplicado),
                })
 
            return JsonResponse({'sucesso': True, 'vendas': vendas_criadas})
 
        except Produto.DoesNotExist as e:
            return JsonResponse({'sucesso': False, 'erro': f'Produto não encontrado: {str(e)}'})
        except ValidationError as e:
            return JsonResponse({'sucesso': False, 'erro': str(e)})
        except Exception as e:
            return JsonResponse({'sucesso': False, 'erro': str(e)})
 
    return JsonResponse({'sucesso': False, 'erro': 'Método não permitido.'})

def excluir_colaboradores(request):
    if request.method == 'POST':
        ids_selecionados = request.POST.getlist('colaboradores_ids') # Pega os usernames selecionados
        
        if ids_selecionados:
            # EM VEZ DE DELETAR, nós desativamos o usuário no Django
            User.objects.filter(username__in=ids_selecionados).update(is_active=False)
            messages.success(request, f'{len(ids_selecionados)} colaborador(es) removido(s) da equipe.')
            
    return redirect('admin_equipe')

@user_passes_test(eh_admin)
def relatorio_vendedores(request):
    data_inicio_str = request.GET.get('data_inicio')
    data_fim_str = request.GET.get('data_fim')

    # Configuração padrão de datas (Hoje)
    hoje = timezone.now().date()
    inicio_dia = make_aware(datetime.combine(hoje, time.min))
    fim_dia = make_aware(datetime.combine(hoje, time.max))
    periodo_label = "Hoje"

    if data_inicio_str and data_fim_str:
        inicio_dia = make_aware(datetime.strptime(data_inicio_str, '%Y-%m-%d'))
        fim_dia = make_aware(datetime.combine(datetime.strptime(data_fim_str, '%Y-%m-%d'), time.max))
        periodo_label = f"{inicio_dia.strftime('%d/%m')} a {fim_dia.strftime('%d/%m')}"

    vendas_queryset = Venda.objects.filter(data_venda__range=(inicio_dia, fim_dia), cancelada=False)

    # Tabela: Agrupamento por Data e Vendedor
    dados_vendedores = vendas_queryset.values(
        'data_venda__date', 'vendedor__first_name', 'vendedor__username'
    ).annotate(
        total_vendas=Sum('preco_total'),
        total_comissao=Sum('valor_comissao')
    ).order_by('-data_venda__date')

    # Cards Financeiros
    total_faturado = vendas_queryset.aggregate(Sum('preco_total'))['preco_total__sum'] or 0
    total_comissoes = vendas_queryset.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0
    
    # Cálculo dinâmico do Imposto (Faturado * Percentual / 100)
    total_imposto = vendas_queryset.annotate(
        imposto_item=F('preco_total') * F('produto__perc_imposto') / 100
    ).aggregate(Sum('imposto_item'))['imposto_item__sum'] or 0

    context = {
        'dados_vendedores': dados_vendedores,
        'total_faturado': total_faturado,
        'total_comissoes': total_comissoes,
        'total_imposto': total_imposto,
        'periodo_label': periodo_label,
        'data_inicio_str': data_inicio_str,
        'data_fim_str': data_fim_str,
    }
    return render(request, 'loja/admin/relatorios/relatorioVendedores.html', context)


@login_required
@user_passes_test(eh_admin)
def relatorio_faturamento(request):
    """View Unificada que carrega todos os dados do dashboard de uma vez"""
    data_inicio_str = request.GET.get('data_inicio')
    data_fim_str    = request.GET.get('data_fim')
 
    hoje       = timezone.now().date()
    inicio_dia = make_aware(datetime.combine(hoje, time.min))
    fim_dia    = make_aware(datetime.combine(hoje, time.max))
    periodo_label = "Hoje"
 
    if data_inicio_str and data_fim_str:
        inicio_dia    = make_aware(datetime.strptime(data_inicio_str, '%Y-%m-%d'))
        fim_dia       = make_aware(datetime.combine(datetime.strptime(data_fim_str, '%Y-%m-%d'), time.max))
        periodo_label = f"{inicio_dia.strftime('%d/%m')} a {fim_dia.strftime('%d/%m')}"
 
    vendas_queryset = Venda.objects.filter(
        data_venda__range=(inicio_dia, fim_dia),
        cancelada=False
    ).select_related('vendedor', 'produto')
 
    # ── Faturamento ──────────────────────────────────────────
    faturamento_por_dia_qs = (
        vendas_queryset
        .annotate(data=TruncDate('data_venda'))
        .values('data')
        .annotate(total=Sum('preco_total'))
        .order_by('data')
    )
    faturamento_por_dia = json.dumps([
        {'data': str(d['data']), 'total': float(d['total'] or 0)}
        for d in faturamento_por_dia_qs
    ])

    mercadorias = vendas_queryset.values('produto__nome').annotate(
        total_venda=Sum('preco_total'),
        qtd=Sum('quantidade_vendida')
    ).order_by('-total_venda')
 
    total_faturado = vendas_queryset.aggregate(Sum('preco_total'))['preco_total__sum'] or 0
 
    agg = vendas_queryset.aggregate(
        _pix      = Sum('valor_pix'),
        _dinheiro = Sum('valor_dinheiro'),
        _debito   = Sum('valor_debito'),
        _credito  = Sum('valor_credito'),
    )
    total_pix      = float(agg['_pix']      or 0)
    total_dinheiro = float(agg['_dinheiro'] or 0)
    total_debito   = float(agg['_debito']   or 0)
    total_credito  = float(agg['_credito']  or 0)
 
    # ── Vendedores ───────────────────────────────────────────
    dados_vendedores = vendas_queryset.values(
        'data_venda__date', 'vendedor__first_name', 'vendedor__username'
    ).annotate(
        total_vendas=Sum('preco_total'),
        total_comissao=Sum('valor_comissao')
    ).order_by('-data_venda__date')
 
    total_comissoes = vendas_queryset.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0
    total_imposto   = vendas_queryset.annotate(
        imposto_item=F('preco_total') * F('produto__perc_imposto') / 100
    ).aggregate(Sum('imposto_item'))['imposto_item__sum'] or 0
 
    # ── Comissões ────────────────────────────────────────────
    comissoes_lista = vendas_queryset.order_by('-data_venda')
    vendas_detalhadas = vendas_queryset.order_by('-data_venda')
    ticket_medio    = vendas_queryset.aggregate(Avg('preco_total'))['preco_total__avg'] or 0
 
    context = {
        'periodo_label':    periodo_label,
        'data_inicio_str':  data_inicio_str,
        'data_fim_str':     data_fim_str,
        'total_faturado':   total_faturado,
        'faturamento_por_dia': faturamento_por_dia,
        'dados_graficos_json': __import__('json').dumps({'faturamento_por_dia': __import__('json').loads(faturamento_por_dia), 'pagamentos': {'pix': round(float(total_pix),2), 'dinheiro': round(float(total_dinheiro),2), 'debito': round(float(total_debito),2), 'credito': round(float(total_credito),2)}}, ensure_ascii=False),
        'mercadorias':      mercadorias,
        'vendas_detalhadas': vendas_detalhadas,
        'total_pix':        total_pix,
        'total_dinheiro':   total_dinheiro,
        'total_debito':     total_debito,
        'total_credito':    total_credito,
        'dados_vendedores': dados_vendedores,
        'total_comissoes':  total_comissoes,
        'total_imposto':    total_imposto,
        'comissoes':        comissoes_lista,
        'ticket_medio':     ticket_medio,
    }
    return render(request, 'loja/admin/relatorios/relatorioFaturamento.html', context)


@user_passes_test(eh_admin)
def cancelar_venda(request, venda_id):
    if request.method == 'POST':
        venda = get_object_or_404(Venda, id=venda_id)
        venda.cancelada = True
        venda.save()
    return redirect(request.META.get('HTTP_REFERER', 'relatorio_faturamento'))