from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('loja', '0008_produto_em_promocao_venda_desconto_aplicado_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='produto',
            name='excluido',
            field=models.BooleanField(default=False, verbose_name='Excluído'),
        ),
    ]
