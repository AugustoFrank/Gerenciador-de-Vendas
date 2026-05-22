from django.contrib import admin
from .models import Produto, Venda, Perfil, EstoqueVendedor

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('referencia', 'nome', 'estoque')
    search_fields = ['nome', 'referencia']
    ordering = ('nome',)

@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendedor', 'produto', 'quantidade_vendida', 'tipo_venda', 'preco_total', 'valor_comissao', 'data_venda')
    list_filter = ('data_venda', 'vendedor', 'tipo_venda')
    search_fields = ('vendedor__username', 'produto__nome')
    readonly_fields = ('preco_total', 'comissao_aplicada', 'valor_comissao', 'data_venda')

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'cargo', 'comissao')
    class Media:
        js = ('loja/js/admin_perfil.js',)

@admin.register(EstoqueVendedor)
class EstoqueVendedorAdmin(admin.ModelAdmin):
    list_display = ('vendedor', 'produto', 'quantidade_atual')
    list_editable = ('quantidade_atual',)
    autocomplete_fields = ['produto', 'vendedor'] 
    list_filter = ('vendedor',)
