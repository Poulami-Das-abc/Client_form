document.addEventListener("DOMContentLoaded", () => {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzsqjpuFupIEmuiSC1QFquRXRxntGMQPWZCL4nkNN6FVWo4sqL-DSO_rWZOm2pwuY1D4A/exec";
  const form = document.getElementById("clientForm");
  const phoneInput = document.getElementById("phone");
  const checkPhoneBtn = document.getElementById("checkPhone");
  const storeInput = document.getElementById("store");
  const remarksInput = document.getElementById("remarks");
  const gstFileInput = document.getElementById("gstFile");
  const status = document.getElementById("status");

  // 🔍 Check if phone exists
  checkPhoneBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    if (!phone) {
      alert("Please enter a phone number first!");
      return;
    }

    status.textContent = "Checking client data...";

    try {
      const res = await fetch(`${WEB_APP_URL}?action=checkClient&phone=${phone}`);
      const data = await res.json();

      if (data.exists) {
        storeInput.value = data.store;
        remarksInput.value = data.remarks;
        storeInput.readOnly = true;
        remarksInput.readOnly = true;
        status.textContent = "✅ Existing client found. Data auto-filled.";
      } else {
        storeInput.value = "";
        remarksInput.value = "";
        storeInput.readOnly = false;
        remarksInput.readOnly = false;
        status.textContent = "ℹ️ New client. Please fill all details.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Error fetching client info.";
    }
  });

  // 📨 Submit Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Submitting...";

    const formData = new FormData(form);
    const file = gstFileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async function () {
        const base64File = reader.result.split(",")[1];
        formData.append("gstFileBase64", base64File);
        formData.append("gstFileName", file.name);
        await sendData(formData);
      };
      reader.readAsDataURL(file);
    } else {
      await sendData(formData);
    }
  });

  async function sendData(formData) {
    const data = new URLSearchParams();
    for (const pair of formData.entries()) {
      data.append(pair[0], pair[1]);
    }

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        body: data,
      });
      const text = await res.text();

      if (text.includes("Success")) {
        status.textContent = "✅ Form submitted successfully!";
        form.reset();
      } else {
        status.textContent = "❌ Submission failed.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Error submitting form.";
    }
  }
});
