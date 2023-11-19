function sendEmail() {
  var params = {
    email: document.getElementById("eee").value,
  };
  const serviceID = "service_mv69qji";
  const templateID = "template_kzog3w8";

  emailjs.send(serviceID, templateID, params).then((res) => {
    document.getElementById("email").value = "";
    console.log(res);
  });
}
