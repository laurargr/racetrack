import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";


export function DriversTable({ drivers, cars }) {
    return (
        <> 
         <Typography variant={"h4"}>Drivers</Typography>
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Car</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {drivers.map((d) => (
                        <TableRow key={d.id}>
                            <TableCell>{d.id}</TableCell>
                            <TableCell>{d.name}</TableCell>
                            <TableCell>{cars.find((c) => c.id === d.assignedCarId)?.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        </>
    )
}