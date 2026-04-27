from django.shortcuts import render
# Create your views here.
from django.shortcuts import render
from django.db.models import Sum
from django.utils import timezone
from .models import Venda, Produto

def visao_geral(request):
    hoje = timezone.now().date()
    vendas_hoje = Venda.objects.filter(data_venda__date=hoje)

    # Ranking: Soma o total de vendas por vendedor e pega os 3 melhores
    ranking = vendas_hoje.values('vendedor__username').annotate(
        total=Sum('preco_total')).order_by('-total')[:3]

    context = {
        'qtd_vendas': vendas_hoje.count(),
        'total_faturado': vendas_hoje.aggregate(Sum('preco_total'))['preco_total__sum'] or 0,
        'total_comissoes': vendas_hoje.aggregate(Sum('valor_comissao'))['valor_comissao__sum'] or 0,
        'alertas_estoque': Produto.objects.filter(estoque__lt=5),
        'ranking': ranking, # Nova variável pro HTML
    }
    return render(request, 'loja/admin/visao_geral.html', context)