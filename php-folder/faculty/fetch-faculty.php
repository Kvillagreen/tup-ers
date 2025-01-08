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
$tokenId = $data['tokenId'] ?? 'caa1040f510863b6dec5faf0c4eff13b477e75185eb42';
if (!$tokenId) {
    include '../fields-required.html';
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
    return 0;
}

$sql = "SELECT * FROM tbl_admin WHERE token_id = ? AND (faculty_type = 'Registrar' OR faculty_type = 'Admin')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    return 0;
}

try {
    // Fetch all classes and check the number of petitions
    $sql = "SELECT faculty_id, first_name, last_name, program, faculty_type, status, date_created,email FROM tbl_admin";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Data found.',
            'data' => $data
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No data found.'
        ]);
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