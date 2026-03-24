<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        .alert-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .alert-box h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 18px;
        }
        .alert-box p {
            color: #78350f;
            margin: 10px 0;
        }
        .reset-link {
            display: block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            font-size: 16px;
        }
        .reset-code {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reset-code-value {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #1e40af;
            font-family: 'Courier New', monospace;
        }
        .info-box {
            background: #f0f9ff;
            border: 2px solid #bfdbfe;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .info-box li {
            margin: 8px 0;
            color: #1e40af;
        }
        .footer {
            background: #f9fafb;
            padding: 25px 20px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2>Hi {{ $name }}!</h2>
            <p>We received a request to reset your password for your 3qaraty account (<strong>{{ $username }}</strong>).</p>
            
            <div class="alert-box">
                <h3>⚠️ Security Notice</h3>
                <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <h3>Reset Your Password</h3>
            <p>Click the button below to reset your password:</p>
            
            <a href="{{ $resetLink }}" class="reset-link">Reset My Password</a>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #3b82f6; word-break: break-all;">{{ $resetLink }}</span>
            </p>
            
            <div class="reset-code">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Reset Code:</p>
                <div class="reset-code-value">{{ $token }}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">You can also enter this code on the password reset page</p>
            </div>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #1e40af;">📝 Important Information:</h4>
                <ul>
                    <li>This link will expire on <strong>{{ $expiresAt }}</strong></li>
                    <li>The reset link can only be used once</li>
                    <li>Your current password will remain active until you set a new one</li>
                    <li>After resetting, you'll need to log in with your new password</li>
                </ul>
            </div>
            
            <h3>Need Help?</h3>
            <p>If you're having trouble resetting your password or didn't request this change, please contact our support team at <a href="mailto:admin@3qaraty.icu">admin@3qaraty.icu</a></p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This email was sent to {{ $email }}</p>
            <p>&copy; {{ date('Y') }} 3qaraty. All rights reserved.</p>
            <p><a href="https://3qaraty.icu">Visit Website</a></p>
            <p style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
                This is an automated security email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>