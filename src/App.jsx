import React, { useState, useEffect } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import './App.css'
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import PropTypes from 'prop-types';
import {
  TextField, Button, Accordion, AccordionSummary,
  Typography, AccordionDetails, CircularProgress,
  TableContainer, Table, TableBody, TableRow, TableCell,
  Paper, TableFooter, TablePagination, Box, useTheme, TableHead, Modal
} from '@mui/material';

import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Copying TablePagination from Material UI Library
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

// Defining table columns for data
const columns = [
  { id: 'name', label: 'Name', minWidth: 10 },
  { id: 'size', label: 'Diameter', minWidth: 10 },
  {
    id: 'hazardous',
    label: 'Hazardous',
    minWidth: 10,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'sentry',
    label: 'Sentry',
    minWidth: 10,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
];

// Defining table rows for data
function createData(name, diameter, hazardous, sentry) {
  return { name, diameter, hazardous, sentry };
}

// Styling Model
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function App() {
  // Define nasaData as the placeholder for holding all the data from the API
  const [nasaData, setNasaData] = useState(undefined)
  // Define date1 as the placeholder for the start date
  const [date1, setDate1] = useState();
  // Define date2 as the placeholder for the end date
  const [date2, setDate2] = useState();
  // Find out if the API was called to add a loading effect.
  const [calledApi, setCalledApi] = useState(false)
  // Added variable to help with functionilty for MUI Table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Added variable to close/open MUI model
  const [open, setOpen] = useState(false);
  
  const [selectedAsteroid, setSelectedAsteroid] = useState([])

  const handleOpen = (row) => {
    setOpen(true);
    /* 
    On Modal Open we set a variable to the row the user clicked so that we can find the previous 
    and next 5 items from this row.
    */
    setSelectedAsteroid(row)
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - nasaData.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle pushing all the data received into the table
  const sanitziseData = (data) => {
    let rows = []

    Object.entries(data["near_earth_objects"]).forEach((dateEntry) => {
      dateEntry[1].forEach((asteroid) => {
        rows.push(createData(
          asteroid.name,
          asteroid.estimated_diameter.kilometers.estimated_diameter_min,
          asteroid.is_potentially_hazardous_asteroid.toString(),
          asteroid.is_sentry_object.toString()
        ))

      })
    })
    return rows
  }

  // Call the nasa API using the dates selected
  const getData = async () => {
    setCalledApi(true)

    try {
      const { data } = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date1["$y"]}-${date1["$M"] + 1}-${date1["$D"]}&end_date=${date2["$y"]}-${date2["$M"] + 1}-${date2["$D"]}&api_key=V4VhaK60WNREB9OsKkbMviUVJlCY0WmZeBv3DMg0`)
      setCalledApi(false)
      const asteroids = sanitziseData(data)

      setNasaData(asteroids)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="App">
      <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center" }}>

        {/* Added two date pickers from Material UI to allow the user to select 2 dates. */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            inputFormat="DD-MM-YYYY"
            views={["day", "month", "year"]}
            label="Start date"
            value={date1}
            onChange={(newValue) => {
              setDate1(newValue);
              getData();
            }}
            renderInput={(params) => <TextField {...params} helperText={null} />}
          />
          <DatePicker
            inputFormat="DD-MM-YYYY"
            label="End date"
            views={["day", "month", "year"]}
            value={date2}
            onChange={(newValue) => {
              setDate2(newValue);
              getData();
            }}
            renderInput={(params) => <TextField {...params} helperText={null} />}
          />
        </LocalizationProvider>
      </div>

      {/* Button to find all the asteroids within the selected dates */}
      <Button sx={{ margin: "10px 0 10px 0" }} variant='outlined' onClick={() => getData()}>Find</Button>
      
      {/* If nasaData is specified then render the table with the asteroids. */}
      {nasaData ?
        <>
          {/* Add table from Material UI to hold all the data. */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="custom pagination table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? nasaData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : nasaData
                ).map((row) => (
                  <TableRow key={row.name} onClick={() => handleOpen(row)}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell style={{ width: 140 }} align="right">
                      {row.diameter}
                    </TableCell>
                    <TableCell style={{ width: 140 }} align="right">
                      {row.hazardous}
                    </TableCell>
                    <TableCell style={{ width: 140 }} align="right">
                      {row.sentry}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Setting up Model from MUI so that user can view previous and next 5 results */}
                <Modal
                  hideBackdrop
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="child-modal-title"
                  aria-describedby="child-modal-description"
                >
                  <Box sx={{ ...style, width: 200, color: "black" }}>
                    <h2 id="child-modal-title">Previous / Next</h2>

                    <div>
                      {/* If the previous asteroid doesn't exist don't display anything. */}
                      {nasaData.indexOf(selectedAsteroid) > 0 ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) - 1].name}</p>
                        :
                        <></>
                      }
                      {nasaData.indexOf(selectedAsteroid) > 1 ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) - 2].name}</p>
                        :
                        <></>
                      }
                      {nasaData.indexOf(selectedAsteroid) > 2 ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) - 3].name}</p>
                        :
                        <></>
                      }
                      {nasaData.indexOf(selectedAsteroid) > 3 ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) - 4].name}</p>
                        :
                        <></>
                      }
                      {nasaData.indexOf(selectedAsteroid) > 4 ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) - 5].name}</p>
                        :
                        <></>
                      }

                      <hr />

                      <p>{selectedAsteroid.name} - Current</p>

                      <hr />

                      {/* If the next asteroid doesn't exist don't display it. */}
                      {nasaData[nasaData.indexOf(selectedAsteroid) + 1] ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) + 1].name}</p>
                        :
                        <></>
                      }
                      {nasaData[nasaData.indexOf(selectedAsteroid) + 2] ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) + 2].name}</p>
                        :
                        <></>
                      }
                      {nasaData[nasaData.indexOf(selectedAsteroid) + 3] ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) + 3].name}</p>
                        :
                        <></>
                      }
                      {nasaData[nasaData.indexOf(selectedAsteroid) + 4] ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) + 4].name}</p>
                        :
                        <></>
                      }
                      {nasaData[nasaData.indexOf(selectedAsteroid) + 5] ?
                        <p>{nasaData[nasaData.indexOf(selectedAsteroid) + 5].name}</p>
                        :
                        <></>
                      }
                    </div>
                    <Button onClick={handleClose}>Close</Button>
                  </Box>
                </Modal>
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                    colSpan={3}
                    count={nasaData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </>
        :
        // Depending on if the API is being called show a progress bar from MUI.
        calledApi ?
          <CircularProgress />
          :
          <></>
      }
    </div>
  )
}

export default App
