export const purchaseSuccessTemplate = ({
  name,
  courseTitle,
  amount,
}) => `
  <div style="font-family: Arial, sans-serif; line-height:1.6">
    <h2>🎉 Thank you for your purchase, ${name}!</h2>

    <p>You have successfully enrolled in:</p>

    <h3>${courseTitle}</h3>

    <p><strong>Amount Paid:</strong> ₹${amount}</p>

    <a href="http://localhost:5173/my-enrollments"
      style="
        display:inline-block;
        margin-top:12px;
        padding:10px 18px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
      ">
      Go to My Courses
    </a>

    <p style="margin-top:20px">
      Happy Learning 🚀<br/>
      <strong>Edemy Team</strong>
    </p>
  </div>
`;
