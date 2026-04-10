import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";


export function DriversTable({ drivers}) {
    return (
        <> 
         <Typography variant={"h4"}>Drivers</Typography>
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {drivers.map((d) => (
                        <TableRow key={d.id}>
                            <TableCell>{d.id}</TableCell>
                            <TableCell>{d.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        </>
    )
}