(function($) {
    $(document).ready(function() {
        // Pega os campos exatos que o Django gera na tela
        var campoCargo = $('#id_cargo');
        var linhaComissao = $('.field-comissao');

        function alternarComissao() {
            if (campoCargo.val() === 'administrador') {
                linhaComissao.hide(); // Esconde a linha inteira
                $('#id_comissao').val('0.00'); // Zera o valor para não dar erro
            } else {
                linhaComissao.show(); // Mostra se for Vendedor
            }
        }

        // Roda a verificação assim que a página abre e toda vez que o cargo mudar
        if (campoCargo.length) {
            alternarComissao();
            campoCargo.on('change', alternarComissao);
        }
    });
})(django.jQuery);