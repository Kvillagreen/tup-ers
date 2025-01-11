<?php
header('Access-Control-Allow-Origin: *'); // You can replace '*' with your frontend URL for added security
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include "connection.php";
require('form-assets.php');

$data = json_decode(file_get_contents("php://input"), true);
$formId = $data['formId'] ?? '';

// Fetch the transaction data based on form_id
$query = "
    SELECT 
        e.event_name, 
        e.event_start, 
        e.event_end, 
        e.details AS event_details,
        k.kiosk_name, 
        t.date_req, 
        t.purpose, 
        t.rent_date, 
        t.status, 
        t.requirements, 
        u.First_name, 
        u.Last_name, 
        u.`Contact#`, 
        u.Company_name, 
        u.Email 
    FROM 
        tbl_transactions t
    JOIN 
        tbl_event e ON t.event_id = e.event_id
    JOIN 
        tbl_kiosk k ON t.kiosk_id = k.kiosk_id
    JOIN 
        tbl_users u ON t.user_id = u.user_info_id
    WHERE 
        t.form_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $formId);
$stmt->execute();
$result = $stmt->get_result();

$row = $result->fetch_assoc();

$fullname = $row['First_name'] . ' ' . $row['Last_name'];
$company_name = $row['Company_name'];
$email = $row['Email'];
$contact = $row['Contact#'];
$date_req = date("M. j, Y, g:i a", strtotime($row['date_req']));
$purpose = $row['purpose'];
$event_start = date("M. j, Y, g:i a", strtotime($row['event_start']));
$event_end = date("M. j, Y, g:i a", strtotime($row['event_end']));
$event_name = $row['event_name'];
$event_details = $row['event_details'];
$kiosk_name = $row['kiosk_name'];
$rentDate = $row['rent_date'];
$rentDateArray = explode(',', $rentDate);
$rentDateLength = count($rentDateArray);
$requirements = $row['requirements'];
if($requirements==''){
    $requirements='N/A';
}
$title = 'Application for Rental of Facilities';
$note = 'Noted: ';
$verified = "Verified:";
$approved = "Approved:";

// Get page size from query string or use default (A4)
$page_size = isset($_GET['page_size']) ? strtoupper($_GET['page_size']) : 'A4';

// Ensure page size is valid, else default to A4
$valid_page_sizes = ['A3', 'A4', 'A5', 'LETTER', 'LEGAL'];
if (!in_array($page_size, $valid_page_sizes)) {
    $page_size = 'A4';
}

class PDF extends FPDF
{
    // Page header
    function Header()
    {
        // Logo
        $this->Image('../../public/dbAssets/formImages/formHeader.png', 10, 0, 190);
        // Line break
        $this->Ln(10);
    }

    // Page footer
    function Footer()
    {
        // Position at 1.5 cm from bottom
        $this->SetY(-15);
        // Line break
        $this->Ln(10);
    }
}

$pdf = new PDF('P', 'mm', $page_size);
$pdf->AddPage();

$pdf->SetFont('Arial', 'B', 20);
// Title
$pdf->Cell(189, 40, $title, 0, 1, 'C');

$pdf->SetFont('Arial', '', 12);

$pdf->Cell(39, 10, 'Kiosk  :', 0, 0);
$pdf->Cell(75, 10, $kiosk_name, 0, 0, 'L');


// Kiosk name
$pdf->Cell(39, 10, 'Contact # :', 0, 0);
$pdf->Cell(75, 10, $contact, 0, 1, 'L');

$pdf->SetFont('Arial', '', 12);
// Request date
$pdf->Cell(39, 10, 'Request Date:', 0, 0);
$pdf->Cell(75, 10, $date_req, 0, 0);
$pdf->Cell(39, 10, 'Event Date & Time :', 0, 0);
$pdf->Cell(75, 10, $event_start, 0, 1);

$pdf->Cell(39, 10, 'Purpose:', 0, 0);
$pdf->Cell(75, 10, $purpose, 0, 0);


$pdf->Cell(39, 10, '', 0, 0);
$pdf->Cell(75, 10, '', 0, 1);

$pdf->Cell(39, 10, 'Things to bring:', 0, 0);
$pdf->Cell(75, 10, $requirements, 0, 1);

$pdf->Cell(39, 10, 'Days to be rented:', 0, 0);
$pdf->Cell(75, 10, $rentDateLength, 0, 1);

$pdf->SetFont('Arial', '', 12);
// Date & Time




//space

$pdf->Cell(189, 20, '', 0, 1, 'C');

// Signature
$pdf->Cell(130, 10, '', 0, 0);
$pdf->Cell(59, 5, $fullname, 0, 1, 'C');
//line
$pdf->Cell(130, 1, '', 0, 0);
$pdf->Cell(59, 1, '___________________________', 0, 1, 'C');

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(130, 10, '', 0, 0);
$pdf->Cell(59, 10, 'Name & Signature of Client', 0, 1, 'C');

// Noted
$pdf->SetFont('Arial', 'B', 15);
$pdf->Cell(94, 30, $note, 0, 0, 'C');
$pdf->Cell(95, 30, '', 0, 1);

$pdf->SetFont('Arial', '', 12);
$pdf->Cell(130, 5, 'Joe Marie D. Dormido, DIT, PCpE', 0, 0, 'C');
$pdf->Cell(59, 5, '', 0, 1);

//line
$pdf->Cell(130, 1, '___________________________________', 0, 0, 'C');
$pdf->Cell(59, 1, '', 0, 1, 'C');

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(130, 10, 'Dean/Unit/Office Head', 0, 0, 'C');
$pdf->Cell(59, 10, '', 0, 1);

// Verified
$pdf->SetFont('Arial', 'B', 15);
$pdf->Cell(95, 30, $verified, 0, 0, 'C');
$pdf->Cell(94, 30, $approved, 0, 1, 'C');

$pdf->SetFont('Arial', '', 12);
$pdf->Cell(95, 5, 'Mark Franz Sumagaysay, PhD/IGP', 0, 0, 'C');
$pdf->Cell(94, 5, 'Edwin H. Bugna PhD/Executive Director.', 0, 1, 'C');
//line
$pdf->Cell(95, 1, '___________________________________', 0, 0, 'C');
$pdf->Cell(94, 1, '___________________________________', 0, 1, 'C');

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(95, 10, 'IGP Coordinator', 0, 0, 'C');
$pdf->Cell(94, 10, 'Executive Director', 0, 1, 'C');




$pdf->Output();


?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Form</title>
    <link href="../user_assets/uploads/CHMSUWeb.png" rel="icon">
    <link href="../user_assets/uploads/CHMSUWeb.png" rel="apple-touch-icon">
</head>

<body>

</body>

</html>