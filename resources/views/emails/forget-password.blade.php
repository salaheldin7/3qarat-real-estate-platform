<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forget Password - 3qaraty</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f4f8;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .reset-code-container {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
        }
        .reset-code-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .reset-code {
            font-size: 32px;
            font-weight: 700;
            color: #1e40af;
            font-family: 'Courier New', monospace;
            letter-spacing: 4px;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        .info-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 6px;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #78350f;
            line-height: 1.5;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hello {{ $name }},</p>
            
            <p class="message">
                We received a request to reset the password for your 3qaraty account (<strong>{{ $username }}</strong>). 
                If you didn't make this request, you can safely ignore this email.
            </p>

            <div class="reset-code-container">
                <div class="reset-code-label">Your Reset Code</div>
                <div class="reset-code">{{ $token }}</div>
                <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                    Click the button below or enter this code manually
                </p>
            </div>

            <center>
                <a href="{{ $resetLink }}" class="button">Reset My Password</a>
            </center>

            <div class="info-box">
                <p><strong>⏰ Important:</strong> This reset link will expire on <strong>{{ $expiresAt }}</strong>. 
                After that, you'll need to request a new one.</p>
            </div>

            <div class="divider"></div>

            <p class="message" style="font-size: 14px;">
                <strong>Security Tips:</strong><br>
                • Never share your reset code with anyone<br>
                • Make sure you're on the official 3qaraty website<br>
                • Choose a strong, unique password<br>
                • If you didn't request this reset, please contact our support team immediately
            </p>

            <p class="message" style="font-size: 13px; color: #9ca3af;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ $resetLink }}" style="color: #3b82f6; word-break: break-all;">{{ $resetLink }}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>3qaraty - Your Real Estate Platform</strong><br>
                Need help? Contact us at <a href="mailto:admin@3qaraty.icu">admin@3qaraty.icu</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                © 2025 3qaraty. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>