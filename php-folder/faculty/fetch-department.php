<?php
// registration.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tokenId = $data['tokenId'] ?? '317b40c5319fa30b2dbd309f40577d2514d4dd53c56c9';
$classId = $data['classId'] ?? '3';

// Verify token
$sql = "SELECT * FROM tbl_admin WHERE token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    exit(0);
}

try {
    // Fetch class details by classId
    $sql = "SELECT 
                subject_code,
                subject_name,
                status,
                units,
                capacity,
                program
            FROM tbl_class 
            WHERE class_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $classId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $code = $row['subject_code'];
        $name = $row['subject_name'];
        $status = $row['status'];
        $units = $row['units'];
        $capacity = $row['capacity'];
        $program = $row['program'];

        // Check for similar classes with pending status and capacity < 50
        $checkSql = "SELECT 
                        class_id,
                        subject_name,
                        subject_code,
                        status,
                        capacity,
                        program
                     FROM tbl_class 
                     WHERE subject_name = ? 
                       AND subject_code = ? 
                       AND units = ? 
                       AND status = 'pending' 
                       AND capacity < 50 AND class_id != ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ssis", $name, $code, $units,$classId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        $data = [];

        if ($checkResult->num_rows > 0) {
            // Fetch all similar records
            while ($similarClass = $checkResult->fetch_assoc()) {
                $data[] = $similarClass;
            }

            echo json_encode([
                'success' => true,
                'message' => 'Similar class found',
                'data' => $data
            ]);
            exit(0);
        }

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No data found.',
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
} finally {
    $conn->close();
}
?>