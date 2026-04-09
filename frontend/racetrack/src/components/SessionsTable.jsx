import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
export function SessionsTable({ sessions, drivers }) {
    return (
        <>
        <Typography variant={"h4"}>Sessions</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Drivers</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.id}</TableCell>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.date}</TableCell>
                                    <TableCell>{s.time}</TableCell>
                                    <TableCell>{s.driverIds.map((id) => drivers.find((d) => d.id === id)?.name).join(", ")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
        </>
    )
}