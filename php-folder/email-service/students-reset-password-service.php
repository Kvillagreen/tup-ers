<?php
// Enable error reporting
require '../connection.php';
// Load PHPMailer classes

date_default_timezone_set('Asia/Manila');
require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

// Get POST data (you would typically pass the email and OTP in the POST request)
$data = json_decode(file_get_contents("php://input"), true);
$hostEmail = $data['hostEmail'] ?? '';
$hostPassword = $data['hostPassword'] ?? '';
$tupvId = $data['tupvId'] ?? '';
$otp = $data['otpCode'] ?? '';  // OTP passed from the request
$recepientEmail = '';
$recepientName = '';
$time = date('h:i A');

if (!$tupvId || !$hostEmail || !$hostPassword || !$otp) {
  echo json_encode([
    'success' => false,
    'message' => 'All fields are required',
  ]);
  exit();
}





$sql = "SELECT * FROM tbl_student WHERE tupv_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tupvId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  $student = $result->fetch_assoc();
  $recepientEmail = $student['email'];
  $recepientName = $student['first_name'] . ' ' . $student['last_name'];
  $otpCode = json_encode([
    'otp' => $otp,
    'time' => $time,
  ]);

  // SQL to UPDATE the otp_code column
  $updateSql = "UPDATE tbl_student SET otp_code = ? WHERE tupv_id = ?";
  $updateStmt = $conn->prepare($updateSql);
  $updateStmt->bind_param("ss", $otpCode, $tupvId);
  $updateStmt->execute();
  
} else {
  echo json_encode([
    'success' => false,
    'message' => 'Invalid Credentials',
    'otpCode' => null,
  ]);

  return false;
}


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = 'smtp.hostinger.com';  // SMTP server
  $mail->SMTPAuth = true;  // Enable SMTP authentication
  $mail->Username = $hostEmail;  // Your Hostinger email address
  $mail->Password = $hostPassword;  // Your email account password
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  // Enable TLS encryption
  $mail->Port = 587;

  $mail->setFrom($hostEmail, 'Admin');  // From email
  $mail->addAddress($recepientEmail, $recepientName);  // To email

  // Content of the email (HTML message)
  $mail->isHTML(true);  // Set email format to HTML
  $mail->Subject = 'Your One-Time Passcode (OTP)';

  // HTML content for the email body
  $htmlContent = '
    <html>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #bc4749;text-decoration:none;font-weight:600">TUPV</a>
    </div>
    <p style="font-size:1.1em">Hi ' . htmlspecialchars(ucwords(strtolower($recepientName))) . ',</p>
    <p>Thank you for using TUPV-petition. Use the following OTP to complete reseting your password. OTP is valid for 5 minutes</p>
    <h2 style="background: #bc4749;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">' . htmlspecialchars($otp) . '</h2>
    <p style="font-size:0.9em;">Regards,<br />TUPV Admin</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>TUP-Visayas</p>
      <p>Capitan Sabi St, Talisay City, Negros Occidental</p>
      <p>Philippines</p>
    </div>
  </div>
</div>
    </html>';

  // Assign the HTML content to the email body
  $mail->Body = $htmlContent;

  // Send email
  if ($mail->send()) {
    echo json_encode([
      'success' => true,
      'message' => 'OTP Sent successfully',
      'otpCode' => $otp,
    ]);
    exit();
  } else {
    echo json_encode([
      'success' => false,
      'message' => 'Error Sending Email',
    ]);
  }

} catch (Exception $e) {
  echo "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>