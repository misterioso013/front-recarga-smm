// Carregar métodos de pagamento
$('.content').ready(function() {

    if(window.localStorage.email != "") {
      $('#email').val(window.localStorage.getItem('email'))
    }
    ajax('/active', {})
    var interval = setInterval(function() {
      if(objAjax[0].status === 'success'){
        clearInterval(interval);
        const arr = objAjax[0].methods
        
        if(arr.picpay) {
          payment_methods.push({name: "PicPay", value: "picpay"})
        }
        if(arr.pix) {
          payment_methods.push({name : "Pix Automático", value: "pix"})
        }
        if(arr.paypal) {
          payment_methods.push({name : "PayPal", value: "paypal"})
        }
        if(arr.mp_cc) {
          payment_methods.push({name : "Cartão de crédito", value: "mp_cc"})
        }
        if(arr.mp_boleto) {
          payment_methods.push({name : "Boleto Bancário", value: "mp_boleto"})
        }
        if(arr.stripe) {
          payment_methods.push(stripe => "Stripe")
        }
      }
    }, 1000)
});

// Salvar dados
let payment_methods = [];
let objAjax = [];

function ajax(path, data) {
    $.ajax({
        url: "https://api.smm.app.br" + path,
        method: 'POST',
        data: data,
        success: function( result ) {
          objAjax.push(JSON.parse(result));
        }
      }).fail(function( error ) {
        alert('Verifique seus dados e tente novamente!')
        window.location.reload();
      });
}

  // Botão de login clicado
  $('#btn-login').on('click', function() {
    if($('#email').val() !== "") {
      $('#btn-login').html(' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...');
    }
  })

  // Recuperar login
  $('#form-login').on('submit', function(e) {
    e.preventDefault();
    objAjax = [];
    ajax('/user/find', {
      email: $('#email').val(),
    });

      var interval = setInterval(function() {
        if(objAjax[0].status === 'success'){
          clearInterval(interval);
          window.localStorage.setItem('id', objAjax[0].id);
          window.localStorage.setItem('email', objAjax[0].email);
          window.localStorage.setItem('name', objAjax[0].name);
          window.localStorage.setItem('refer_id', objAjax[0].refer_id);

          // Criar forma de pagamento
          $("#form-login").css('display', "none");
          $("#form-payment").css('display', "block");
          
          for(var i = 0; i < payment_methods.length; i++) {
            $('#select-method-payment').append(`<option value="${payment_methods[i].value}">${payment_methods[i].name}</option>`)
          }
        }
      }, 2000)
  });

  // Recuperar forma de pagamento
  $('#select-method-payment').on('change', function() {
    if($('#select-method-payment').val() !== "") {
      if($('#select-method-payment').val() === "picpay") {
        $('#payment-info').html(`<div class="mb-3">
      <label>E-mail do PicPay</label>
      <input type="email" class="form-control" placeholder="E-mail da sua conta PicPay" id="picpay_email" required></div>
      <div class="mb-3">
      <label>CPF</label>
      <input type="text" class="form-control" id="cpf" placeholder="Digite seu CPF" required></div>
      <div class="mb-3">
      <label>Telefone</label>
      <input type="text" class="form-control" id="number" placeholder="Digite seu número" required></div>`);
            // Auto preencher o campo de email do PicPay
  if(window.localStorage.getItem('picpay_email') !== null) {
    $('#picpay_email').val(window.localStorage.getItem('picpay_email'));
  }
      }

      if($('#select-method-payment').val() === "pix") {
        $('#payment-info').html(`<div class="mb-3"><label>CPF</label><input type="text" class="form-control" id="cpf" placeholder="Digite seu CPF" required></div>
        <div class="form-text text-muted mb-3">Seu saldo estará disponível após a confirmação do pagamento.</div>`);
      }
        // Criar mascara para o CPF
$("#cpf").mask('000.000.000-00', {reverse: true});
        // Criar mascara para o número celular
$("#number").mask('(00) 00000-0000');

// Auto complete do campo de CPF
if( window.localStorage.getItem('cpf') !== null ) {
  $('#cpf').val(window.localStorage.getItem('cpf'));
}
    }
  });

  // Valor mínimo de pagamento
  $('#price-payment').on('keyup', function() {
    var value_payment = $('#price-payment').val().replace(",", ".");
    if(value_payment !== "") {
      if(value_payment >= 5) {
        $('#price-payment').addClass('is-valid');
        $('#price-payment').removeClass('is-invalid');
      }else{
        $('#price-payment').addClass('is-invalid');
      }
    }
  });
  // Criar mascara do valor do pagamento
  $('#price-payment').mask('#.##0,00', {reverse: true});

  // Formulário de pagamento enviado
  $('#form-payment').on('submit', function(e) {
    e.preventDefault();
    if($('#price-payment').val() !== "" && $("#select-method-payment").val() !== "") {
    objAjax = [];
    $('#btn-payment').html(' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...');
    
    if($("#select-method-payment").val() === "picpay") {
      window.localStorage.setItem('picpay_email', $('#picpay_email').val());
    window.localStorage.setItem('cpf', $('#cpf').val());
    window.localStorage.setItem('number', $('#number').val());

    const objSend = {
      id: window.localStorage.getItem('id'),
      email: window.localStorage.getItem('email'),
      type_payment: $('#select-method-payment').val(),
      value: $('#price-payment').val().replace(",", "."),
      picpay_mail: window.localStorage.getItem('picpay_email'),
      cpf: window.localStorage.getItem('cpf'),
      number: window.localStorage.getItem('number'),

    }
    ajax(`/payment/${window.localStorage.refer_id}/create`, objSend);
  }
  if($('#select-method-payment').val() === "pix") {
    window.localStorage.setItem('cpf', $('#cpf').val());
    const objSend = {
      id: window.localStorage.getItem('id'),
      email: window.localStorage.getItem('email'),
      type_payment: $('#select-method-payment').val(),
      value: $('#price-payment').val().replace(",", "."),
      cpf: window.localStorage.getItem('cpf'),
    }
    ajax(`/payment/${window.localStorage.refer_id}/create`, objSend);
  }

    if($('#select-method-payment').val() === "picpay") {
      var intervalpicpay = setInterval(function() {
        if(objAjax[0].referenceId != null) {
          clearInterval(intervalpicpay);
          window.location.href = objAjax[0].paymentUrl;
        }
      }, 2000)
    }
    if($('#select-method-payment').val() === "pix") {
      var intervalpix = setInterval(function() {
        if(objAjax[0].referenceId != null) {
          clearInterval(intervalpix);
          window.localStorage.setItem('refer_id', objAjax[0].referenceId);
          $(".content").html(`<div class="card card-login"><div class="card-body"><div class="mb-3 text-center">
          <h1 class="h3 mb-3 font-weight-normal">Escanie o Qr Code abaixo:</h1>
          <img src="${objAjax[0].image}" alt="Qr Code Pix" class="img-fluid"></div>
          <div class="mb-3 text-muted text-center">Referência: ${objAjax[0].referenceId}</div>
          <div class="mb-3">
          <label>Pix copiar e colar</label>
          <input type="text" class="form-control" id="pix_gen" placeholder="Pix copiar e colar" readonly value="${objAjax[0].copy}"/>
          <div class="form-text text-muted mb-3">Copie o código acima e pague no banco de sua escolha.</div>
          </div>
          <button type="button" class="btn btn-primary" id="btn-copy">Copiar</button> <button type="button" class="btn btn-success" id="btn-verify-pix" style="margin-left:15px;">Verificar o pagamento</button>
          </div>
          </div>`);

          $('#btn-copy').on('click', function() {
            $('#pix_gen').select();
            document.execCommand('copy');

            $('#btn-copy').html('Copiado');
            setTimeout(function() {
              $('#btn-copy').html('Copiar');
            }, 2000);

          });

          $('#btn-verify-pix').on('click', function() {
            window.location.href = `./pedido.html?refer=${window.localStorage.refer_id}`;
          });
        }
      }, 2000)
    }

  }else{
    alert('Preencha todos os campos!')
  }
  });


