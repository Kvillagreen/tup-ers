<?php
// registration.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Handle preflight request
}

include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$lastName = $data['lastName'] ?? Null;
$firstName = $data['firstName'] ?? Null;
$email = $data['email'] ?? Null;
$tupvId = $data['tupvId'] ?? Null;
$password = $data['password'] ?? Null;
$program = $data['program'] ?? Null;
$status = 'enable';
$otpCode = json_encode([
    'otp' => '',
    'time' => '',
]);
$tokenId = uniqid(); // Generate a unique token ID if not provided
$dateCreated = date('Y-m-d H:i:s');
if (!$lastName || !$firstName || !$email || !$tupvId || !$password || !$program) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}

try {
    // Check if the tupv_id exists
    $isTupvIdExist = $conn->prepare("SELECT * FROM `tbl_student` WHERE `tupv_id` = ?");
    $isTupvIdExist->bind_param("s", $tupvId);
    $isTupvIdExist->execute();
    $tupvIdResult = $isTupvIdExist->get_result();

    // Check if the email exists
    $isEmailExist = $conn->prepare("SELECT * FROM `tbl_student` WHERE `email` = ?");
    $isEmailExist->bind_param("s", $email);
    $isEmailExist->execute();
    $emailResult = $isEmailExist->get_result();


    $isNameExist = $conn->prepare("SELECT * FROM `tbl_student` WHERE `first_name` = ? AND `last_name` = ?");
    $isNameExist->bind_param("ss", $firstName, $lastName);
    $isNameExist->execute();
    $nameResult = $isNameExist->get_result();

    if ($tupvIdResult && $tupvIdResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'TUPV ID already exists, please login to your account.'
        ]);
        exit();
    }

    if ($nameResult && $nameResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Name already exist, If you believe this is an error, please contact the registrar for assistance.'
        ]);
        exit();
    }

    if ($emailResult && $emailResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already exists, please login to your account.'
        ]);
        exit();
    }

    // Hash the password for security
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $insertQuery = $conn->prepare(
        "INSERT INTO `tbl_student` (`first_name`, `last_name`, `email`, `tupv_id`, `password`, `program`, `token_id`,`status`, `date_created`,`otp_code`) 
        VALUES (?,?,?,?,?,?,?,?,?,?)"
    );
    $insertQuery->bind_param("ssssssssss", $firstName, $lastName, $email, $tupvId, $hashedPassword, $program, $tokenId, $status, $dateCreated,$otpCode);

    if ($insertQuery->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful. You can now login your account',
            'token' => $tokenId
        ]);
    } else {
        throw new Exception('Registration failed. Please try again later.');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close the database connection
    $conn->close();
}
?>