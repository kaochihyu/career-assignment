import * as React from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { flexbox } from '@material-ui/system';

import { gql, useLazyQuery } from "@apollo/client";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

export const CHARACTER_QUERY = gql`
  query queryCharacter($search: String = "中") { 
    Character (search: $search) {
      name { 
        full
        native
      }  
      image {
        medium
      }
    }
  }
`;

export const STAFF_QUERY = gql`
  query queryStaff($search: String!) {
    Staff (search: $search) {
      name { 
        full
        native
      }  
      image {
        medium
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  // TODO
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  '& .MuiTextField-root': {
    margin: theme.spacing(2),
    width: '25ch',
  },
}));


function AniSearch() {
  const classes = useStyles();

  const [getCharacter, { loading, data }] = useLazyQuery(CHARACTER_QUERY);
  const [getStaff, staffResult] = useLazyQuery(STAFF_QUERY);
  
  // TODO

  const [searchType, setSearchType] = React.useState('Character');
  const [searchInput, setSearchInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [name, setName] = React.useState('No result.');
  const [image, setImage] = React.useState('');

  const handleChangeType = (event) => {
    setName('No result.')
    setImage('')
    setSearchType(event.target.value);
  };

  const handleChangeInput = (event) => {
    setName('No result.')
    setImage('')
    setSearchInput(event.target.value)
  };

  const handleClickButton = () => {
    setIsLoading(true)
    setName('')
    setImage('')
    var query = `
      query queryCharacter($search: String!) { 
        ${searchType} (search: $search) {
          name { 
            full
            native
          }  
          image {
            medium
          }
        }
      }
    `;

    var variables = {
      search: searchInput
    };

    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };

    // Make the HTTP Api request
    fetch(url, options)
      .then(handleResponse)
      .then(handleData)
      .catch(handleError);

    function handleResponse(response) {
      return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
      });
    }

    function handleData(data) {
      console.log(data)
      setIsLoading(false)
      if (data.data.Character) {
        setName(data.data.Character.name.native)
        setImage(data.data.Character.image.medium)
      } else {
        setName(data.data.Staff.name.native)
        setImage(data.data.Staff.image.medium)
      }
    }

    function handleError(error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
    {/* TODO */}
      <Box display="flex" alignItems="flex-end" m={2}>
        <FormControl className={classes.formControl}>
          <InputLabel shrink id="search-type-label">
            Search Type
          </InputLabel>
          <Select
            labelId="search-type-label"
            id="search-type"
            value={searchType}
            onChange={handleChangeType}
            displayEmpty
            className={classes.selectEmpty}
          >
            <MenuItem value={"Character"}>
              Character
            </MenuItem>
            <MenuItem value={"Staff"}>Staff</MenuItem>
          </Select>
        </FormControl>
        <Box ml={1}>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="standard-basic" label="Keyword" onChange={handleChangeInput}/>
          </form>
        </Box>
        <Box ml={1}>
          <Button variant="contained" color="primary" size="small" onClick={handleClickButton}>
            Search
          </Button>
        </Box>
      </Box>
      <Box m={2} flexDirection="column">
        {isLoading && <CircularProgress />}
        <p>{name}</p>
        <img src={image} />
      </Box>
    </Container>);
}

export default AniSearch;
