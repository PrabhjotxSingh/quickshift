// src/pages/PaymentSettings/PaymentSettings.tsx
import Topbar from "../Parts/Topbar/Topbar";
import "./PaymentSettings.css";
import { useState } from "react";

// Import images
import ApplePayImg from "./ApplePay.png";
import PayPalImg from "./PayPal.png";

type PaymentMethod = "card" | "paypal" | "apple";

export default function PaymentSettings() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Payment method "${paymentMethod}" saved!`);
  };

  return (
    <>
      <Topbar />
      <div className="payment-container payment-content">
        <h2>Payment Method</h2>
        <p className="payment-subtitle">
          Add a new payment method to your account.
        </p>

        <div className="method-selector">
          <div
            className={`method-card ${paymentMethod === "card" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="method-icon">💳</div>
            <div className="method-name">Card</div>
          </div>
          <div
            className={`method-card ${paymentMethod === "paypal" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("paypal")}
          >
            <img src={PayPalImg} alt="PayPal" className="method-icon" />
            <div className="method-name">PayPal</div>
          </div>
          <div
            className={`method-card ${paymentMethod === "apple" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("apple")}
          >
            <img
              src={ApplePayImg}
              alt="Apple Pay"
              className="method-icon apple-pay"
            />
            <div className="method-name">Apple</div>
          </div>
        </div>

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" placeholder="First Last" required />
          </div>

          <div className="form-row">
            <label htmlFor="city">City</label>
            <input id="city" type="text" placeholder="City" required />
          </div>

          <div className="form-row">
            <label htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          <div className="form-row expires-row">
            <div>
              <label htmlFor="expires-month">Expires</label>
              <div className="split-inputs">
                <select id="expires-month" required>
                  <option value="">Month</option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select id="expires-year" required>
                  <option value="">Year</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cvc">CVC</label>
              <input id="cvc" type="text" placeholder="CVC" required />
            </div>
          </div>

          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>
      </div>
    </>
  );
}
