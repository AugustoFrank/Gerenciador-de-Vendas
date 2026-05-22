from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from loja import views

urlpatterns = [
    path('admin-django/', admin.site.urls),
    
    # ROTA DE LOGIN CORRIGIDA
    path('', views.custom_login, name='login'),
    
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('redirecionamento/', views.redirecionamento_login, name='redirecionamento_login'),

    # Rotas do Vendedor
    path('visao-geral/', views.visao_geral, name='visao_geral'),
    path('nova-venda/', views.nova_venda, name='nova_venda'),
    path('estoque-vendedor/', views.estoque, name='estoque_vendedor'),
    path('minhas-comissoes/', views.comissoes, name='comissoes_vendedor'),

    # AJAX Vendedor
    path('buscar-produto-ajax/', views.buscar_produto_ajax, name='buscar_produto_ajax'),
    path('consulta-estoque/', views.consulta_estoque_venda, name='consulta_estoque'),   

    # Rotas do Admin
    path('admin/visao-geral/', views.visao_geral_admin, name='visao_geral_admin'),
    path('admin/equipe/', views.admin_equipe, name='admin_equipe'),
    path('admin/equipe/add/', views.add_colaborador, name='adicionar_colaborador'),
    path('admin/estoque/', views.admin_estoque, name='admin_estoque'),
    path('admin/relatorio-admin/', views.relatorio_admin, name='relatorio_admin'),
    path('editar-colaborador/', views.editar_colaborador, name='editar_colaborador'),
    path('buscar-usuario-id/', views.buscar_usuario_por_id, name='buscar_usuario_id'),
    path('admin/adicionar-estoque/', views.adicionar_estoque_admin, name='adicionar_estoque_admin'),
    path('finalizar-venda/', views.finalizar_venda, name='finalizar_venda'),
    path('admin/equipe/excluir/', views.excluir_colaboradores, name='excluir_colaboradores'),
    path('admin/relatorio-vendedores/', views.relatorio_vendedores, name='relatorio_vendedores'),
    path('admin/relatorio-faturamento/', views.relatorio_faturamento, name='relatorio_faturamento'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)