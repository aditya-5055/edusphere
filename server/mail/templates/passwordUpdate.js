 

exports.passwordUpdated = (email, name) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>EduSphere Password Update Confirmation</title>
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

            <div class="message">Password Updated Successfully</div>

            <div class="body">
                <p>Hello ${name},</p>

                <p>Your password has been successfully updated for the account:</p>

                <p><span class="highlight">${email}</span></p>

                <p>If you did not request this change, please contact our support team immediately.</p>
            </div>

            <div class="support">
                Need help? Contact us at 
                <a href="mailto:noreply.edusphereacademy@gmail.com">
                noreply.edusphereacademy@gmail.com</a>
            </div>
        </div>
    </body>
    
    </html>`;
};