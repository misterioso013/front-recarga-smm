
$(document).ready(function() {
    // Pegar id do pedido na URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('refer');

    // Pegar dados do pedido
    $.ajax({
        url: `https://api.smm.app.br/order/${id}/find`,
        method: 'POST',
        success: function(result) {
            if(!result) {
                $('#status').html(`<span class="text-danger">Seu pedido não foi encontrado!</span>`);
            } else {
            const status = JSON.parse(result);
            if(status.status == "success") {
            // Traduzir status
            switch (status.payment) {
                case 'pending': $("#status").html(`<span class="text-warning">Seu pedido está Pedente</span>`);
                    break;
                case 'paid':
                case "completed":
                case "approved":  
                    $("#status").html(`<span class="text-success">Seu pedido foi pago</span>`);
                    break;
                case 'canceled': 
                case 'refunded':
                case 'changeback':
                case "expired":
                case "rejected":
                $("#status").html(`<span class="text-danger">Seu pedido foi cancelado</span>`);
                    break;

                case 'analysis':
                        $("#status").html(`<span class="text-warning">Seu pagamento está em processo de análise anti-fraude<span>`);
                        break;
            }
            
        }
    }
        }
    });
});
