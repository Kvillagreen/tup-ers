<?php

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
$tokenId = $data['tokenId'] ?? '0ad6297f03fee22563724954762f6a7af7ec3a1f782d1';
$studentId = $data['studentId'] ?? '2';
$classId = $data['classId'] ?? '3';

if (!$tokenId || !$studentId || !$classId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit;
}

// Verify class exists
$sql = "SELECT * FROM tbl_class WHERE class_id = ?";
$classQuery = $conn->prepare($sql);
$classQuery->bind_param("s", $classId);
$classQuery->execute();
$resultClassQuery = $classQuery->get_result()->fetch_assoc();

if (!$resultClassQuery) {
    echo json_encode([
        'success' => false,
        'message' => 'Class not found',
    ]);
    exit;
}

$name = $resultClassQuery['subject_name'];
$code = $resultClassQuery['subject_code'];
$units = $resultClassQuery['units'];

// Verify student token
$sql = "SELECT * FROM tbl_student WHERE token_id = ? AND student_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $tokenId, $studentId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    exit;
}

try {
    // Fetch all petition_id and class_id from tbl_petition
    $sql = "SELECT petition_id, class_id FROM tbl_petition WHERE student_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();

    $isDuplicate = false;
    $duplicates = [];

    while ($row = $result->fetch_assoc()) {
        $petitionClassId = $row['class_id'];

        // Check if class details match
        $checkSql = "SELECT * FROM tbl_class WHERE class_id = ? AND subject_name = ? AND subject_code = ? AND units = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ssss", $petitionClassId, $name, $code, $units);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            $isDuplicate = true;
            $duplicates[] = $row['petition_id'];
        }
    }

    if ($isDuplicate) {
        echo json_encode([
            'duplicate' => true,
            'message' => 'Duplicate entry detected.',
            'duplicates' => $duplicates
        ]);
    } else {
        echo json_encode([
            'duplicate' => false,
            'message' => 'No duplicate entries found.',
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