import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon,
  Add as AddIcon,
} from '@mui/icons-material';

/**
 * Credit Card Payments Component - MUI Version
 * Tracks estimated monthly credit card payments
 */
function CreditCardPayments() {
  const [creditCards, setCreditCards] = useState([]);
  const [formData, setFormData] = useState({
    cardName: '',
    estimatedMonthlyPayment: '',
    creditLimit: '',
    currentBalance: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, cardId: null });

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/credit-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCreditCards(data.creditCards || []);
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cardName || !formData.estimatedMonthlyPayment) {
      alert('Please fill in card name and monthly payment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/credit-cards/${editingId}`
        : 'http://localhost:5000/credit-cards';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardName: formData.cardName,
          estimatedMonthlyPayment: parseFloat(formData.estimatedMonthlyPayment),
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
          currentBalance: formData.currentBalance ? parseFloat(formData.currentBalance) : null,
        })
      });

      if (response.ok) {
        setFormData({
          cardName: '',
          estimatedMonthlyPayment: '',
          creditLimit: '',
          currentBalance: '',
        });
        setEditingId(null);
        fetchCreditCards();
      } else {
        alert('Error saving credit card');
      }
    } catch (error) {
      console.error('Error saving credit card:', error);
      alert('Error saving credit card');
    }
  };

  const handleEdit = (card) => {
    setFormData({
      cardName: card.cardName,
      estimatedMonthlyPayment: card.estimatedMonthlyPayment,
      creditLimit: card.creditLimit || '',
      currentBalance: card.currentBalance || '',
    });
    setEditingId(card._id);
  };

  const handleDelete = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/credit-cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCreditCards();
        setDeleteDialog({ open: false, cardId: null });
      }
    } catch (error) {
      console.error('Error deleting credit card:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      cardName: '',
      estimatedMonthlyPayment: '',
      creditLimit: '',
      currentBalance: '',
    });
    setEditingId(null);
  };

  const totalMonthlyPayment = creditCards.reduce(
    (sum, card) => sum + (parseFloat(card.estimatedMonthlyPayment) || 0),
    0
  );

  const totalBalance = creditCards.reduce(
    (sum, card) => sum + (parseFloat(card.currentBalance) || 0),
    0
  );

  const utilization = creditCards.reduce((sum, card) => {
    if (card.creditLimit && card.currentBalance) {
      return sum + (parseFloat(card.currentBalance) / parseFloat(card.creditLimit)) * 100;
    }
    return sum;
  }, 0) / Math.max(creditCards.length, 1);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Credit Card Payments
        </Typography>
        <Typography color="text.secondary">
          Track your credit card payments and balances
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Total Monthly Payment
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  ${totalMonthlyPayment.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {creditCards.length} card{creditCards.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Total Balance
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  ${totalBalance.toFixed(2)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Avg Utilization
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                  {utilization.toFixed(1)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Cards Tracked
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>
                  {creditCards.length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Form Section */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title={editingId ? 'Edit Credit Card' : 'Add New Credit Card'} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Card Name"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="e.g., Discover Card"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Payment"
                    name="estimatedMonthlyPayment"
                    type="number"
                    value={formData.estimatedMonthlyPayment}
                    onChange={handleInputChange}
                    inputProps={{ step: '0.01', min: '0' }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Credit Limit"
                    name="creditLimit"
                    type="number"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Balance"
                    name="currentBalance"
                    type="number"
                    value={formData.currentBalance}
                    onChange={handleInputChange}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  startIcon={editingId ? <EditIcon /> : <AddIcon />}
                >
                  {editingId ? 'Update Card' : 'Add Card'}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Cards List */}
      <Card>
        <CardHeader title="Your Credit Cards" />
        <CardContent>
          {creditCards.length === 0 ? (
            <Alert severity="info">
              No credit cards added yet. Add your first card above to start tracking!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {creditCards.map((card) => {
                const utilRatio = card.creditLimit && card.currentBalance 
                  ? (parseFloat(card.currentBalance) / parseFloat(card.creditLimit)) * 100
                  : 0;
                const utilizationColor = utilRatio > 75 ? '#EF4444' : utilRatio > 50 ? '#F59E0B' : '#10B981';

                return (
                  <Grid item xs={12} sm={6} md={4} key={card._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Stack spacing={0.5}>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {card.cardName}
                              </Typography>
                              <Chip
                                label={`$${parseFloat(card.estimatedMonthlyPayment).toFixed(2)}/mo`}
                                color="primary"
                                size="small"
                              />
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(card)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, cardId: card._id })}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Box>

                          {card.creditLimit && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Utilization: {utilRatio.toFixed(1)}%
                              </Typography>
                              <Box sx={{
                                height: 6,
                                bgcolor: 'rgba(0, 0, 0, 0.1)',
                                borderRadius: 1,
                                overflow: 'hidden',
                                mt: 0.5
                              }}>
                                <Box sx={{
                                  height: '100%',
                                  width: `${Math.min(utilRatio, 100)}%`,
                                  bgcolor: utilizationColor,
                                }} />
                              </Box>
                            </Box>
                          )}

                          {card.currentBalance && (
                            <Box>
                              <Typography variant="body2">
                                Balance: <span style={{ fontWeight: 700 }}>${parseFloat(card.currentBalance).toFixed(2)}</span>
                              </Typography>
                            </Box>
                          )}

                          {card.creditLimit && (
                            <Box>
                              <Typography variant="body2">
                                Limit: <span style={{ fontWeight: 700 }}>${parseFloat(card.creditLimit).toFixed(2)}</span>
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, cardId: null })}
      >
        <DialogTitle>Delete Credit Card</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this credit card? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, cardId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.cardId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreditCardPayments;
