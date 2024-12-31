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
$email = $data['email'] ?? Null;
$currentPassword = $data['currentPassword'] ?? Null;
$newPassword = $data['newPassword'] ?? Null;
$tokenId = $data['tokenId'] ?? Null;
$studentId = $data['studentId'] ?? Null;
$tupvId = $data['tupvId'] ?? Null;


if (!$tupvId || !$studentId || !$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}


try {
    if ($newPassword && $currentPassword && $email) {
        $sql = "SELECT * FROM tbl_student WHERE tupv_id = ? AND token_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $tupvId, $tokenId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($currentPassword, $user['password'])) {
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $updateQuery = $conn->prepare(
                    "UPDATE `tbl_student` SET `password` = ? , `email` = ? WHERE `student_id` = ? AND `tupv_id` = ? AND `token_id` = ? "
                );
                $updateQuery->bind_param("sssss", $hashedPassword, $email, $studentId, $tupvId, $tokenId);
                if ($updateQuery->execute()) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Update successfully, Relogin to verify changes',
                    ]);
                } else {
                    throw new Exception('Registration failed. Please try again later.');
                }

            } else {
                echo json_encode(['success' => false, 'message' => 'Your current password is invalid.']);
            }
        }
    } else {
        $updateQuery = $conn->prepare(
            "UPDATE `tbl_student` SET  `email` = ? WHERE `student_id` = ? AND `tupv_id` = ? AND `token_id` = ? "
        );
        $updateQuery->bind_param("ssss", $email, $studentId, $tupvId, $tokenId);
        if ($updateQuery->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Update successfully, Relogin to verify changes',
            ]);
        } else {
            throw new Exception('Registration failed. Please try again later.');
        }
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