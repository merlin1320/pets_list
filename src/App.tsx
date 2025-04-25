import axios from 'axios'
import { useEffect, useState } from 'react'
import './App.css'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface Pet {
  id?: number;
  petName: string;
  owner: string;
  imageUrl?: string;
  favoriteFood?: string;
  dateCreated: Date;
  fed?: boolean;
}

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [newPet, setNewPet] = useState({
    petName: '',
    owner: '',
    imageUrl: '',
    favoriteFood: '',
  });
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const apiUrl = 'https://c07e-2603-8000-ca01-ada4-60c4-674b-9116-79d5.ngrok-free.app/pets';

  // Helper to fetch pets
  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      setPets(res.data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPet({ ...newPet, [e.target.name]: e.target.value });
  };

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewPet({ petName: '', owner: '', imageUrl: '', favoriteFood: '' });
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const petToAdd = { ...newPet, fed: false };
      const res = await axios.post(apiUrl, petToAdd);
      setPets(prev => [...prev, res.data]);
      handleDialogClose();
    } catch {
      // Optionally handle error
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFed = async (id: number) => {
    setPets(prevPets => prevPets.map((pet) =>
      pet.id === id ? { ...pet, fed: !pet.fed } : pet
    ));
    const toggledPet = pets.find((pet) => pet.id === id);
    if (toggledPet) {
      try {
        await axios.patch(`${apiUrl}/${id}`, { fed: !toggledPet.fed });
      } catch {
        // Optionally handle error (e.g., revert UI change or show a message)
      }
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}/${id}`);
      await fetchPets(); // Refresh the table after deletion
    } catch {
      // Optionally handle error (e.g., show a message)
    }
  };

  // Download pets as JSON
  const handleDownload = () => {
    const data = JSON.stringify(pets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pets.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns: GridColDef<Pet>[] = [
    { field: 'petName', headerName: 'Pet Name', flex: 1 },
    { field: 'owner', headerName: 'Owner', flex: 1 },
    {
      field: 'imageUrl',
      headerName: 'Image',
      flex: 1,
      renderCell: (params) =>
        params.value ? <img src={params.value} alt={params.row.petName} style={{ width: 50 }} /> : '-',
      sortable: false,
      filterable: false,
    },
    {
      field: 'favoriteFood',
      headerName: 'Favorite Food',
      flex: 1,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'age',
      headerName: 'Age (hours)',
      flex: 1,
      renderCell: (params) => {
        const birthday = params.value;
        if (!birthday) return '-';
        const birth = new Date(birthday);
        const now = new Date();
        const diffMs = now.getTime() - birth.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60));
      },
      sortable: false,
      filterable: false,
    },
    {
      field: 'fed',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant={params.value ? 'contained' : 'outlined'}
          color={params.value ? 'success' : 'warning'}
          onClick={() => handleToggleFed(Number(params.row.id))}
        >
          {params.value ? 'Fed' : 'Not Fed'}
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <Button color="error" onClick={() => handleRemove(Number(params.row.id))}>
          Remove
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      bgcolor: '#181c24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <Box sx={{
        width: '50vw',
        bgcolor: '#4169e1', // royal blue
        borderRadius: 3,
        boxShadow: 6,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ color: '#fff' }}>Pets List</h2>
        <Button variant="contained" color="primary" sx={{ mb: 2, alignSelf: 'flex-end' }} onClick={handleDialogOpen}>
          Add Pet
        </Button>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle sx={{ color: '#000' }}>Add a New Pet</DialogTitle>
          <form onSubmit={handleAddPet}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350, color: '#000' }}>
              <TextField
                label="Pet Name"
                name="petName"
                value={newPet.petName}
                onChange={handleInputChange}
                required
                size="small"
              />
              <TextField
                label="Owner"
                name="owner"
                value={newPet.owner}
                onChange={handleInputChange}
                required
                size="small"
              />
              <TextField
                label="Image URL"
                name="imageUrl"
                value={newPet.imageUrl}
                onChange={handleInputChange}
                size="small"
              />
              <TextField
                label="Favorite Food"
                name="favoriteFood"
                value={newPet.favoriteFood}
                onChange={handleInputChange}
                size="small"
              />
            </DialogContent>
            <DialogActions sx={{ color: '#000' }}>
              <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={adding}>
                {adding ? 'Adding...' : 'Add Pet'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Button variant="contained" sx={{ mb: 2, alignSelf: 'flex-end', bgcolor: '#283593' }} onClick={handleDownload}>
          Download JSON
        </Button>
        <DataGrid
          rows={pets}
          columns={columns}
          loading={loading}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          getRowId={(row => row.id as number)}
          sx={{
            bgcolor: '#1a237e',
            color: '#fff',
            borderRadius: 2,
            width: '100%',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#90caf9 !important', // lighter blue
              color: '#1a237e !important', // dark blue text for contrast
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#1a237e !important',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-columnHeader': {
              color: '#1a237e !important',
            },
            '& .MuiDataGrid-cell': {
              color: '#fff',
              borderColor: '#283593',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#1976d2',
              color: '#fff',
              borderColor: '#283593',
            },
            '& .MuiTablePagination-root, & .MuiTablePagination-toolbar, & .MuiTablePagination-selectLabel, & .MuiTablePagination-input, & .MuiTablePagination-select, & .MuiSelect-select': {
              color: '#fff',
              backgroundColor: '#1976d2',
            },
            '& .MuiSvgIcon-root': {
              color: '#fff',
            },
            '& .MuiInputBase-root': {
              color: '#fff',
            },
            '& .Mui-disabled': {
              color: '#bdbdbd',
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default App
