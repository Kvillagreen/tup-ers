
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
$tokenId = $data['tokenId'] ?? Null;
$classId = $data['classId'] ?? Null;

if (empty($tokenId) || empty($classId)) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
    exit(0);
}

// Validate admin token
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
    // Step 1: Fetch all petitions for the class
    $sqlQuery = "
    SELECT 
        s.first_name,
        s.last_name,
        s.student_id,
        s.tupv_id,
        s.email,
        p.*  -- All columns from tbl_petition
    FROM tbl_petition p
    JOIN tbl_student s ON p.student_id = s.student_id
    WHERE p.class_id = ?
";

    $stmt = $conn->prepare($sqlQuery);
    $stmt->bind_param("s", $classId);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No petitions found.',
        ]);
        exit(0);
    }

    // Step 2: Fetch all class details for the class_id
    $sqlClassQuery = "
    SELECT * FROM tbl_class WHERE class_id = ?
";

    $stmt = $conn->prepare($sqlClassQuery);
    $stmt->bind_param("s", $classId);
    $stmt->execute();
    $classResult = $stmt->get_result();

    if ($classResult->num_rows > 0) {
        // Add class data to the response
        $classData = $classResult->fetch_assoc();
        foreach ($data as &$row) {
            $row['class_data'] = $classData; // Attach class data to each petition
        }

        echo json_encode([
            'success' => true,
            'data' => $data,
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Class data not found.',
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
