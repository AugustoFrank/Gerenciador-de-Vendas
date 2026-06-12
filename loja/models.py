from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from PIL import Image
import random
from decimal import Decimal, ROUND_HALF_UP

class Produto(models.Model):
    referencia = models.CharField("Codigo/sku", max_length=5, unique=True, null=True, blank=True)
    nome = models.CharField("Nome da Mercadoria", max_length=200)
    estoque = models.IntegerField("Estoque Atual", default=0)

    # Campos de Custo e Margens
    valor_compra = models.DecimalField("Valor de Compra", max_digits=10, decimal_places=2)
    perc_imposto = models.DecimalField("Percentual de Imposto (%)", max_digits=5, decimal_places=2, default=0.00)
    perc_varejo = models.DecimalField("Percentual de Margem de Lucro para Varejo (%)", max_digits=5, decimal_places=2, default=0.00)
    perc_atacado = models.DecimalField("Percentual de Margem de Lucro para Atacado (%)", max_digits=5, decimal_places=2, default=0.00)
    em_promocao = models.BooleanField("Em Promoção", default=False)
    excluido = models.BooleanField("Excluído", default=False)

    # Preços calculados automaticamente
    valor_venda_varejo = models.DecimalField("Preço de Varejo", max_digits=10, decimal_places=2, editable=False, null=True)
    valor_venda_atacado = models.DecimalField("Preço de Atacado", max_digits=10, decimal_places=2, editable=False, null=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def save(self, *args, **kwargs):
        # 1. Validação de segurança
        if self.estoque < 0:
            raise ValidationError('O estoque não pode ser negativo!')

        # 2. Geração automática de SKU (Referência)
        if not self.referencia:
            while True:
                codigo = str(random.randint(0, 99999)).zfill(5)
                if not Produto.objects.filter(referencia=codigo).exists():
                    self.referencia = codigo
                    break

        # 3. Cálculo matemático preciso das margens
        compra = Decimal(str(self.valor_compra))
        imposto = compra * (Decimal(str(self.perc_imposto)) / Decimal('100'))
        
        # Cálculo Varejo
        margem_varejo = compra * (Decimal(str(self.perc_varejo)) / Decimal('100'))
        self.valor_venda_varejo = (compra + imposto + margem_varejo).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Cálculo Atacado
        margem_atacado = compra * (Decimal(str(self.perc_atacado)) / Decimal('100'))
        self.valor_venda_atacado = (compra + imposto + margem_atacado).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        self.full_clean() 
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} (Ref: {self.referencia})"

# ==========================================
# ESTOQUE POR VENDEDOR
# ==========================================

class EstoqueVendedor(models.Model):
    vendedor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Vendedor")
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, verbose_name="Mercadoria")
    quantidade_atual = models.IntegerField("Quantidade com o Vendedor", default=0)

    class Meta:
        unique_together = ('vendedor', 'produto')
        verbose_name = "Estoque do Vendedor"
        verbose_name_plural = "Estoques dos Vendedores"

    def __str__(self):
        return f"{self.vendedor.username}: {self.quantidade_atual}x {self.produto.nome}"

# ==========================================
# MODELO DE VENDA
# ==========================================

class Venda(models.Model):
    FORMA_PAGAMENTO_CHOICES = [
        ('dinheiro', 'Dinheiro'),
        ('pix', 'Pix'),
        ('credito', 'Crédito'),
        ('debito', 'Débito'),
        ('credito_pix', 'Crédito + Pix'),
        ('credito_dinheiro', 'Crédito + Dinheiro'),
        ('credito_debito', 'Crédito + Débito'),
        ('debito_pix', 'Débito + Pix'),
        ('debito_dinheiro', 'Débito + Dinheiro'),
        ('dinheiro_pix', 'Dinheiro + Pix'),
    ]
    BANDEIRAS_CHOICES = [
        ('visa', 'Visa'),
        ('master', 'Mastercard'),
        ('hiper', 'Hipercard'),
        ('elo', 'Elo'),
        ('outra', 'Outra'),
    ]
 
    bandeira_cartao    = models.CharField("Bandeira do Cartão", max_length=20, choices=BANDEIRAS_CHOICES, null=True, blank=True)
    vendedor           = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Vendedor")
    produto            = models.ForeignKey(Produto, on_delete=models.CASCADE, verbose_name="Produto")
    quantidade_vendida = models.PositiveIntegerField("Quantidade Vendida")
    tipo_venda         = models.CharField("Tipo de Venda", max_length=20, choices=[('varejo', 'Varejo'), ('atacado', 'Atacado')])
    forma_pagamento    = models.CharField("Forma de Pagamento", max_length=50, choices=FORMA_PAGAMENTO_CHOICES, default='dinheiro')
    data_venda         = models.DateTimeField("Data da Venda", auto_now_add=True)
 
    # Financeiro
    preco_total        = models.DecimalField("Preço Total da Venda",   max_digits=10, decimal_places=2, editable=False)
    comissao_aplicada  = models.DecimalField("Comissão Aplicada (%)",  max_digits=5,  decimal_places=2, default=0.00)
    valor_comissao     = models.DecimalField("Valor da Comissão (R$)", max_digits=10, decimal_places=2, default=0.00)
 
    # Desconto
    em_promocao        = models.BooleanField("Em Promoção", default=False)
    cancelada          = models.BooleanField("Cancelada", default=False)
    desconto_aplicado  = models.DecimalField("Desconto Aplicado (%)", max_digits=5, decimal_places=2, default=0.00)
 
    # Frações por forma de pagamento (para pagamentos compostos)
    valor_credito      = models.DecimalField("Valor no Crédito",  max_digits=10, decimal_places=2, default=0.00)
    valor_debito       = models.DecimalField("Valor no Débito",   max_digits=10, decimal_places=2, default=0.00)
    valor_pix          = models.DecimalField("Valor no Pix",      max_digits=10, decimal_places=2, default=0.00)
    valor_dinheiro     = models.DecimalField("Valor no Dinheiro", max_digits=10, decimal_places=2, default=0.00)
 
    class Meta:
        verbose_name = "Venda"
        verbose_name_plural = "Vendas"
 
    def save(self, *args, **kwargs):
        venda_nova = self.pk is None
        if venda_nova:
            if self.tipo_venda == 'varejo':
                unitario = self.produto.valor_venda_varejo
            else:
                unitario = self.produto.valor_venda_atacado
 
            self.preco_total = unitario * self.quantidade_vendida
 
            # Desconto 10% para pagamento individual sem promoção
            FORMAS_COM_DESCONTO = ['dinheiro', 'pix', 'debito']
            if not self.em_promocao and self.forma_pagamento in FORMAS_COM_DESCONTO:
                self.desconto_aplicado = Decimal('10.00')
                self.preco_total = (self.preco_total * Decimal('0.90')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            else:
                self.desconto_aplicado = Decimal('0.00')
 
            # Distribuição por forma de pagamento
            # Para formas simples, o total vai inteiro para a forma correspondente
            # Para formas compostas, os valores já vêm preenchidos pela view
            if self.forma_pagamento == 'credito':
                self.valor_credito = self.preco_total
            elif self.forma_pagamento == 'debito':
                self.valor_debito = self.preco_total
            elif self.forma_pagamento == 'pix':
                self.valor_pix = self.preco_total
            elif self.forma_pagamento == 'dinheiro':
                self.valor_dinheiro = self.preco_total
            # Para compostos, os valores já chegam preenchidos da view
 
            if self.vendedor and hasattr(self.vendedor, 'perfil'):
                self.comissao_aplicada = self.vendedor.perfil.comissao
 
            percentual_decimal = Decimal(str(self.comissao_aplicada)) / Decimal('100')
            self.valor_comissao = (self.preco_total * percentual_decimal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
 
            if self.produto.estoque < self.quantidade_vendida:
                raise ValidationError(f"Estoque insuficiente! O saldo atual de {self.produto.nome} é de {self.produto.estoque} unidades.")
 
            self.produto.estoque -= self.quantidade_vendida
            self.produto.save()
 
        super().save(*args, **kwargs)


# ==========================================
# PERFIL DO COLABORADOR
# ==========================================

class Perfil(models.Model):
    CARGO_CHOICES = [
        ('administrador', 'Administrador'),
        ('vendedor', 'Vendedor'),
    ]
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name="perfil", null=True)
    cargo = models.CharField("Cargo", max_length=20, choices=CARGO_CHOICES, default='vendedor')
    comissao = models.DecimalField("Percentual de Comissão (%)", max_digits=5, decimal_places=2, default=0.00)
    
    # Informações Pessoais
    endereco = models.CharField("Endereço", max_length=255, blank=True, null=True)
    telefone = models.CharField("Telefone", max_length=20, blank=True, null=True)
    data_nascimento = models.DateField("Data de Nascimento", blank=True, null=True)
    
    # Customização e Sistema
    cor_banner = models.CharField("Cor do Banner (Hex)", max_length=10, default='#1E294A', null=True, blank=True)
    foto = models.ImageField("Foto de Perfil", upload_to='avatares/', blank=True, null=True, max_length=255)
    matricula = models.CharField("ID de Acesso (Matrícula)", max_length=5, unique=True, null=True, blank=True)

    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuários"

    def save(self, *args, **kwargs):
        # Geração automática da matrícula
        if not self.matricula:
            while True:
                codigo = str(random.randint(0, 99999)).zfill(5)
                if not Perfil.objects.filter(matricula=codigo).exists():
                    self.matricula = codigo
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.usuario.username} - {self.cargo} (ID: {self.matricula})"
    

class HistoricoPreco(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='historicos')
    data_alteracao = models.DateTimeField(auto_now_add=True)
    
    # Valores no momento da alteração
    valor_compra = models.DecimalField(max_digits=10, decimal_places=2)
    perc_imposto = models.DecimalField(max_digits=5, decimal_places=2)
    perc_varejo = models.DecimalField(max_digits=5, decimal_places=2)
    perc_atacado = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Saldo que entrou e saldo final
    quantidade_adicionada = models.IntegerField()
    estoque_final = models.IntegerField()

    class Meta:
        verbose_name = "Histórico de Preço e Estoque"
        verbose_name_plural = "Históricos de Preços e Estoques"
        ordering = ['-data_alteracao']

    def __str__(self):
        return f"{self.produto.nome} - {self.data_alteracao.strftime('%d/%m/%Y')}"
    
