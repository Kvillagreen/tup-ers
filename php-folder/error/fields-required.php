<?php
// Set the response code to 404
http_response_code(404);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            text-align: center;
            padding: 50px;
        }

        h1 {
            font-size: 3rem;
            color: #e63946;
        }

        p {
            font-size: 1.2rem;
        }

        a {
            color: #0077cc;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <h1>Access Restricted</h1>
    <p>We regret to inform you that the page you are trying to access is restricted. <br>Please contact the
        administrator if you believe this is an error.</p>
</body>

</html>