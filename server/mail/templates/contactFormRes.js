 

exports.contactUsEmail = (
  email,
  firstname,
  lastname,
  message,
  phoneNo,
  countrycode
) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>EduSphere Contact Confirmation</title>
      <style>
          body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
              color: #333333;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
          }

          .logo {
              max-width: 200px;
              margin-bottom: 20px;
          }

          .message {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
          }

          .body {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: left;
          }

          .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
          }
      </style>
  
  </head>
  
  <body>
      <div class="container">
          <a href="https://edusphere-academy.netlify.app">
              <img class="logo"
     src="https://res.cloudinary.com/dh2eftqpi/image/upload/v1771075489/Screenshot_2026-02-14_at_5.30.50_PM_mcv6nh.png"
     alt="EduSphere Logo">
          </a>

          <div class="message">Thank You for Contacting EduSphere</div>

          <div class="body">
              <p>Dear ${firstname} ${lastname},</p>

              <p>Thank you for reaching out to <strong>EduSphere</strong>. 
              We have received your message and our team will respond within 24 hours.</p>

              <p><strong>Your Submitted Details:</strong></p>

              <p>Name: ${firstname} ${lastname}</p>
              <p>Email: ${email}</p>
              <p>Phone Number: +${countrycode} ${phoneNo}</p>
              <p>Message: ${message}</p>

              <p>We appreciate your interest in EduSphere.</p>
          </div>

          <div class="support">
              For urgent queries, contact us at 
              <a href="mailto:noreply.edusphereacademy@gmail.com">
              noreply.edusphereacademy@gmail.com</a>
          </div>
      </div>
  </body>
  
  </html>`
}



exports.contactUsInternalEmail = (
  email,
  firstname,
  lastname,
  message,
  phoneNo,
  countrycode
) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>New Contact Form Submission</title>
      <style>
          body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
              color: #333333;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
          }

          .logo {
              max-width: 200px;
              margin-bottom: 20px;
          }

          .message {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
          }

          .body {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: left;
          }

          .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
          }

          .badge {
              display: inline-block;
              background-color: #FFD60A;
              color: #000000;
              font-weight: bold;
              font-size: 13px;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 20px;
          }
      </style>
  
  </head>
  
  <body>
      <div class="container">
          <a href="https://edusphere-academy.netlify.app">
              <img class="logo"
     src="https://res.cloudinary.com/dh2eftqpi/image/upload/v1771075489/Screenshot_2026-02-14_at_5.30.50_PM_mcv6nh.png"
     alt="EduSphere Logo">
          </a>

          <div class="badge">New Message Received</div>

          <div class="message">New Contact Form Submission</div>

          <div class="body">
              <p>Hello Team,</p>

              <p>You have received a new contact form submission on 
              <strong>EduSphere</strong>. Please find the details below:</p>

              <p><strong>Submitted Details:</strong></p>

              <p>Name: ${firstname} ${lastname}</p>
              <p>Email: ${email}</p>
              <p>Phone Number: +${countrycode} ${phoneNo}</p>
              <p>Message: ${message}</p>

              <p>Please respond to the user within 24 hours.</p>
          </div>

          <div class="support">
              This is an automated notification from
              <a href="https://edusphere-academy.netlify.app">
              EduSphere Academy</a>
          </div>
      </div>
  </body>
  
  </html>`
}