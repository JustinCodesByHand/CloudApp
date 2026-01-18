import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Refresh as RefreshIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { formatDate } from '../utils/transactionUtils';

/**
 * Transaction Table Display Component - MUI Version
 */
const TransactionTable = ({
  transactions,
  onScanReceipt,
  onRefresh,
  onAddAnother,
  onFirstTransactionClick,
  onDeleteTransaction,
}) => {
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false, transaction: null });

  if (transactions.length === 0) {
    return (
      <Card sx={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No transactions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first transaction or scan a receipt!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CameraAltIcon />}
            onClick={onFirstTransactionClick}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              mt: 2,
            }}
          >
            Scan Your First Receipt
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleDeleteClick = (transaction) => {
    setDeleteDialog({ open: true, transaction });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.transaction) {
      onDeleteTransaction(deleteDialog.transaction._id || deleteDialog.transaction.id);
      setDeleteDialog({ open: false, transaction: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, transaction: null });
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'income' ? 'success' : 'error'}
          variant="filled"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const sign = params.row.type === 'income' ? '+' : '-';
        return `${sign}$${Math.abs(params.value).toFixed(2)}`;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteClick(params.row)}
          title="Delete transaction"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const rows = transactions.map((transaction, index) => ({
    id: transaction._id || index,
    ...transaction,
  }));

  return (
    <>
      <Card sx={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <CardHeader
          title="Recent Transactions"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CameraAltIcon />}
                onClick={onScanReceipt}
              >
                Scan Receipt
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            </Stack>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(224, 224, 224, 0.1)',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderBottom: '1px solid rgba(224, 224, 224, 0.2)',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            />
          </Box>

          {/* Footer with transaction count and add another */}
          <Box sx={{ px: 2, py: 2, borderTop: '1px solid rgba(224, 224, 224, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {transactions.length} transactions
            </Typography>
            {transactions.length > 0 && (
              <Button
                size="small"
                color="primary"
                onClick={onAddAnother}
              >
                Add Another Transaction
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the transaction "{deleteDialog.transaction?.description}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransactionTable;
