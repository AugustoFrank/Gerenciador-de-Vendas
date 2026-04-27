from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models import Sum, Count
# Create your models here.

class Produto (models.Model):

    referencia = models.CharField("Codigo/sku", max_length=5, unique=True)
    nome = models.CharField("Nome da Mercadoria", max_length=200)
    estoque = models.IntegerField("Estoque Atual", default=0)

    valor_compra = models.DecimalField("Valor de Compra", max_digits=10, decimal_places=2)
    perc_imposto = models.DecimalField("Percentual de Imposto (%)", max_digits=5, decimal_places=2, default=0.00)
    perc_varejo = models.DecimalField("Percentual de Margem de Lucro para Varejo (%)", max_digits=5, decimal_places=2, default=0.00)
    perc_atacado = models.DecimalField("Percentual de Margem de Lucro para Atacado (%)", max_digits=5, decimal_places=2, default=0.00)

    valor_venda_varejo = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True)
    valor_venda_atacado = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True)

    def clean(self):
        if self.estoque < 0:
            raise ValidationError('O estoque não pode ser negativo!')

    def save(self, *args, **kwargs):
        self.full_clean() # Força a validação antes de salvar
        super().save(*args, **kwargs)

class EstoqueVendedor(models.Model):
    vendedor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Vendedor")
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, verbose_name="Mercadoria")
    quantidade_atual = models.IntegerField("Quantidade com o Vendedor", default=0)

    class Meta:
        unique_together = ('vendedor', 'produto')
        verbose_name = "Estoque do Vendedor"
        verbose_name_plural = "Estoques dos Vendedores"

    def __str__(self):
        return f"{self.vendedor.username} tem {self.quantidade_atual}x {self.produto.nome}"
    
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

    vendedor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Vendedor")
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade_vendida = models.PositiveIntegerField("Quantidade Vendida")
    tipo_venda = models.CharField("Tipo de Venda", max_length=20, choices=[('varejo', 'Varejo'), ('atacado', 'Atacado')])
    forma_pagamento = models.CharField("Forma de Pagamento", max_length=50, choices=FORMA_PAGAMENTO_CHOICES, default='dinheiro')
    data_venda = models.DateTimeField("Data da Venda", auto_now_add=True)
    preco_total = models.DecimalField("Preço Total", max_digits=10, decimal_places=2, editable=False)

    comissao_aplicada = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    valor_comissao = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        venda_nova = self.pk is None 

        if venda_nova:
            try:
                estoque_do_cara = EstoqueVendedor.objects.get(vendedor=self.vendedor, produto=self.produto)
            except EstoqueVendedor.DoesNotExist:
                raise ValidationError(f"O vendedor {self.vendedor.username} não tem esse produto no estoque dele!")

            if estoque_do_cara.quantidade_atual < self.quantidade_vendida:
                raise ValidationError(f"Estoque insuficiente! Você só tem {estoque_do_cara.quantidade_atual} unidades no seu estoque pessoal.")

            if self.tipo_venda == 'varejo':
                unitario = self.produto.valor_venda_varejo
            else:
                unitario = self.produto.valor_venda_atacado
            self.preco_total = unitario * self.quantidade_vendida

            if self.vendedor and hasattr(self.vendedor, 'perfil'):
                self.comissao_aplicada = self.vendedor.perfil.comissao
            
            percentual_decimal = self.comissao_aplicada / 100
            self.valor_comissao = self.quantidade_vendida * percentual_decimal

            estoque_do_cara.quantidade_atual -= self.quantidade_vendida
            estoque_do_cara.save()

        super().save(*args, **kwargs)

class Perfil(models.Model):
    CARGO_CHOICES = [
        ('administrador', 'Administrador'),
        ('vendedor', 'Vendedor'),
    ]
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name="perfil", null=True)
    cargo = models.CharField("Cargo", max_length=20, choices=CARGO_CHOICES, default='vendedor')
    comissao = models.DecimalField("Percentual de Comissão (%)", max_digits=5, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.usuario.username} - {self.cargo}"


def visao_geral(request):
    hoje = timezone.now().date()
    vendas_hoje = Venda.objects.filter(data_venda__date=hoje)

    # Ranking de Vendedores (Quem faturou mais hoje)
    ranking_vendedores = Venda.objects.filter(data_venda__date=hoje)\
        .values('vendedor__username')\
        .annotate(total_vendas=Sum('preco_total'))\
        .order_by('-total_vendas')[:5]

    # Produto mais vendido hoje
    produto_destaque = ItemVenda.objects.filter(venda__data_venda__date=hoje)\
        .values('produto__nome')\
        .annotate(total_qtd=Sum('quantidade'))\
        .order_by('-total_qtd').first()

    context = {
        # ... seus dados anteriores ...
        'ranking': ranking_vendedores,
        'produto_destaque': produto_destaque,
    }
    return render(request, 'loja/admin/visao_geral.html', context)