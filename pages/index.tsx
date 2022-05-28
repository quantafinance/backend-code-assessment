import { useCallback, useMemo, useState } from "react";
import type { NextPage } from "next";

import { useQuery } from "react-query";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import InputAdornment from "@mui/material/InputAdornment";

import { DataGrid, GridColDef, GridFilterModel } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import { Typography } from "@mui/material";

async function getLoans(page: number = 0, pageSize: number = 10, searchTerm: string = ""): Promise<any> {
  const res = await fetch(`/api/loans?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`);
  return res.json();
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 50 },
  { field: "address1", headerName: "Street Address", width: 200 },
  { field: "city", headerName: "City", width: 180 },
  { field: "state", headerName: "State", width: 100 },
  { field: "zipCode", headerName: "Zip Code", width: 100 },
  { field: "companyName", headerName: "Company Name", width: 200 },
  { field: "amount", headerName: "Loan Amount", width: 200 },
  { field: "loanTerm", headerName: "Term", width: 200 },
  { field: "loanRate", headerName: "Interest Rate", width: 200 },
];

const Home: NextPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const queryOptions = useMemo(() => ({
    page, pageSize
  }), [page, pageSize])

  const { isLoading, data } = useQuery(["loans", queryOptions.page, queryOptions.pageSize], () =>
    getLoans(page, pageSize, searchTerm)
  );

  const [rows, rowCount, loanAmountTotal] = useMemo(() => {
    if (typeof data === 'undefined') {
      return [[], 0]
    }
    console.log('data', data)
    return data ?? [[], 0]
  }, [data])

  const onSearchHandler = (e: Record<string, any>) => {
    const newSearch = e.target.value
    getLoans(page, pageSize, newSearch)
    console.log("newSearch", newSearch)
    setSearchTerm(newSearch)
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>Quanta Code Assessment</Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ pt: 15 }}>
        <TextField
          label="Search"
          placeholder="search by address or company..."
          sx={{ width: 350, marginBottom: 4}}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={onSearchHandler}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          autoHeight
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          onPageSizeChange={(pageSize) => setPageSize(pageSize)}
          onPageChange={(page) => setPage(page)}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          onFilterModelChange={onSearchHandler}
        />
        <Typography style={{textAlign: 'right'}} variant="h5" gutterBottom component="div">Total Loan Amount: $ {loanAmountTotal}</Typography>
      </Container>
    </>
  );
};

export default Home;
