import React,{useEffect,useState } from 'react'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {Data,EntityFunctions} from '../models/dataTable';
import Notifications from './Notifications';
import ConfirmDialog from './ConfirmDialog';
import { Typography } from '@mui/material';
import { Stack } from 'react-bootstrap';


//coopy to models/datatable
interface Props {
  mydata: Data;
  setmydata:any;
  entityFunctions:EntityFunctions;
  setgrid:any
}
const initialRows: GridRowsProp = [
  
];

//copy to models/datatable
interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
  mydata:Data;
  setmydata:any;
  setIsAdd:any;
  
}
 //export to componennets
function EditToolbar(props: EditToolbarProps) {
  const { setRows,setIsAdd,mydata, setRowModesModel,setmydata} = props;

  const handleAddClick = () => {
    setIsAdd(true);
    const newId = mydata.rows[mydata.rows.length - 1][mydata.rowId] + 1;
    //???mydata.rows[0][mydata.rowId]-1;
    let tempObj:any = {};
    Object.keys(mydata.rows[0]).map((key) => {
      if (key == mydata.rowId)
      { 
        tempObj[key] = newId;
      }
      else {
        tempObj[key] = "";
      }
    });
    let tempRows=[...mydata.rows,tempObj];
    let tempData:Data={...mydata};
    tempData.rows=tempRows;
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newId]: { mode: GridRowModes.Edit, fieldToFocus: mydata.rowId },
    }));
    console.log("modeee",newId.mode);
    setmydata(tempData);



  };

  return (
    <GridToolbarContainer>
      <Stack>
      <Typography align="center" variant="h4" component="h3">
        {mydata.title}
      </Typography>
      </Stack>

 
      <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
        Add record
      </Button>
   

    </GridToolbarContainer>
  );
}
//change name to custom grid
export default function FullFeaturedCrudGrid({mydata,setmydata,entityFunctions,setgrid}:Props) {
  //const {deleteFunc}=entityFunctions
  //states
  const [startFlag,setStartFlag]=React.useState(true);
  const [rows, setRows] = React.useState(mydata.rows);
  const [columns,setColumns]=React.useState<GridColDef[]>(mydata.columns);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [notify, setNotify] = useState({ isOpen: false, message: '', type: '' })
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subTitle: '',onConfirm:()=>{}})
  const [isAdd,setIsAdd]=React.useState(false);
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
//functions
  const handleEditClick = (id: GridRowId) => () => {
    setIsAdd(false);
    console.log("handleEditClick",id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    console.log("iddddddddd",id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) =>  {
   setConfirmDialog({
    ...confirmDialog,
    isOpen: false
})
   setRows(mydata.rows.filter((row) => row.id !== id));
    let res= entityFunctions.deleteFunc(Number(id));
    setgrid((prevCheck:boolean) => !prevCheck);

    setNotify({
      isOpen: true,
      message: 'Deleted Successfully',
      type: 'error'
  })

  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    console.log(newRow);
    let res= entityFunctions.addFunc(newRow);
    
    const updatedRow = { ...newRow, isNew: isAdd };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
//refresh the new data
setNotify({
  isOpen: true,
  message: 'Added Successfully',
  type: 'success'
})
    setgrid((prevCheck:boolean) => !prevCheck);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

//exsit to mo/column
const column: GridColDef = 
{
  field: 'actions',
  type: 'actions',
  headerName: 'Actions',
  width: 100,
  cellClassName: 'actions',
  getActions: ({ id }) => {
    const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
    console.log("isInEditMode",isInEditMode);
    if (isInEditMode) {
      return [
        <GridActionsCellItem
          icon={<SaveIcon />}
          label="Save"
          sx={{
            color: 'primary.main',
          }}
          onClick={handleSaveClick(id)}
        />,
        <GridActionsCellItem
          icon={<CancelIcon />}
          label="Cancel"
          className="textPrimary"
          onClick={handleCancelClick(id)}
          color="inherit"
        />,
      ];
    }

    return [
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Edit"
        className="textPrimary"
        onClick={handleEditClick(id)}
        color="inherit"
      />,
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => {
          setConfirmDialog({
              isOpen: true,
              title: 'Are you sure to delete this record?',
              subTitle: "You can't undo this operation",
              onConfirm: () => {
                 handleDeleteClick(id);
                }
          })
      }}
        color="inherit"
      />,
    ];
  },
}


function initialStates(){
  if(startFlag){
    setColumns((prevColumns)=>[...mydata.columns,column]);
  
  }
  else
  {
    setColumns((prevColumns)=>[...prevColumns,column]);
  
  }
}
useEffect(initialStates,[isAdd]);
  return (

    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >      
      <DataGrid
        getRowId={(row) =>row[mydata?.rowId]}
        rows={mydata?.rows}
        columns={columns}
        loading={!mydata.rows.length}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows,mydata,setIsAdd,setRowModesModel,setmydata},
        }}

        initialState={{
          pagination: {
            paginationModel: { pageSize:10, page: 0 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
       <Notifications
                notify={notify}
                setNotify={setNotify}
            />
       <ConfirmDialog
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
    </Box>
  );
}