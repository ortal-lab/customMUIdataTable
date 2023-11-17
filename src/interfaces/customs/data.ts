import {GridColDef} from '@mui/x-data-grid';

export interface Data {
    columns: GridColDef[];
    rows: any[];
    rowId:string;
    api:string;
    title:string;
  }