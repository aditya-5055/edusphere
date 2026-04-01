 

exports.courseEnrollmentEmail = (courseName, name) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>EduSphere Course Enrollment Confirmation</title>
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

          .cta {
              display: inline-block;
              padding: 10px 20px;
              background-color: #FFD60A;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              margin-top: 20px;
          }

          .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
          }

          .highlight {
              font-weight: bold;
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

          <div class="message">Course Enrollment Confirmation</div>

          <div class="body">
              <p>Dear ${name},</p>

              <p>You have successfully enrolled in the course 
              <span class="highlight">"${courseName}"</span>.</p>

              <p>Welcome to <strong>EduSphere</strong>!  
              We are excited to have you on your learning journey.</p>

              <p>Please log in to your dashboard to access course content.</p>

              <a class="cta" href="https://edusphere-academy.netlify.app/dashboard">
                  Go to Dashboard
              </a>
          </div>

          <div class="support">
              If you need help, contact us at 
              <a href="mailto:noreply.edusphereacademy@gmail.com">
              noreply.edusphereacademy@gmail.com</a>
          </div>
      </div>
  </body>
  
  </html>`;
};