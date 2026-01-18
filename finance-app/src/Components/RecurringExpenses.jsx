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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useLoading } from '../hooks/useLoading';

/**
 * Recurring Expenses Component - MUI Version
 * Tracks recurring expenses that can be automatically added weekly, bi-weekly, or monthly
 */
function RecurringExpenses() {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [editingIncome, setEditingIncome] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    category: 'Other',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expenseId: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setIsLoading, setLoadingVariant } = useLoading();

  const CATEGORIES = ['Housing', 'Utilities', 'Food', 'Transportation', 'Insurance', 'Subscriptions', 'Other'];
  const FREQUENCIES = ['weekly', 'biweekly', 'monthly'];

  useEffect(() => {
    setIsLoading(true);
    setLoadingVariant('recurring');
    fetchRecurringExpenses().finally(() => {
      setIsLoading(false);
    });
    // Load monthly income from localStorage
    const savedIncome = localStorage.getItem('expectedMonthlyIncome');
    if (savedIncome) {
      setMonthlyIncome(savedIncome);
    }
  }, []);

  const handleSaveMonthlyIncome = () => {
    if (monthlyIncome && parseFloat(monthlyIncome) > 0) {
      localStorage.setItem('expectedMonthlyIncome', monthlyIncome);
      setSuccess('Monthly income saved successfully!');
      setEditingIncome(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Please enter a valid monthly income');
    }
  };

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/recurring-expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecurringExpenses(data.recurringExpenses || []);
      } else if (response.status === 404) {
        setError('Recurring expenses endpoint not available. Please initialize database.');
      } else {
        setError('Failed to fetch recurring expenses');
      }
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      setError('Error loading recurring expenses: ' + error.message);
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
    setError('');
    setSuccess('');
    
    if (!formData.name || !formData.amount || !formData.frequency) {
      setError('Please fill in name, amount, and frequency');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/recurring-expenses/${editingId}`
        : 'http://localhost:5000/recurring-expenses';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          category: formData.category,
          description: formData.description,
        })
      });

      if (response.ok) {
        setSuccess(editingId ? 'Recurring expense updated!' : 'Recurring expense created!');
        setFormData({
          name: '',
          amount: '',
          frequency: 'monthly',
          category: 'Other',
          description: '',
        });
        setEditingId(null);
        fetchRecurringExpenses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error saving recurring expense');
      }
    } catch (error) {
      console.error('Error saving recurring expense:', error);
      setError('Error: ' + error.message);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      name: expense.name,
      amount: expense.amount,
      frequency: expense.frequency,
      category: expense.category || 'Other',
      description: expense.description || '',
    });
    setEditingId(expense.id);
  };

  const handleDeleteClick = (expenseId) => {
    setDeleteDialog({ open: true, expenseId });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/recurring-expenses/${deleteDialog.expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Recurring expense deleted');
        fetchRecurringExpenses();
        setDeleteDialog({ open: false, expenseId: null });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      setError('Error deleting: ' + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      category: 'Other',
      description: '',
    });
    setEditingId(null);
  };

  const calculateMonthlyImpact = () => {
    return recurringExpenses.reduce((sum, expense) => {
      const monthlyAmount = expense.frequency === 'weekly'
        ? parseFloat(expense.amount) * 4.33
        : expense.frequency === 'biweekly'
        ? parseFloat(expense.amount) * 2.17
        : parseFloat(expense.amount);
      return sum + monthlyAmount;
    }, 0);
  };

  const calculateAnnualImpact = () => {
    return recurringExpenses.reduce((sum, expense) => {
      const annualAmount = expense.frequency === 'weekly'
        ? parseFloat(expense.amount) * 52
        : expense.frequency === 'biweekly'
        ? parseFloat(expense.amount) * 26
        : parseFloat(expense.amount) * 12;
      return sum + annualAmount;
    }, 0);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'weekly': 'Every Week',
      'biweekly': 'Every 2 Weeks',
      'monthly': 'Monthly'
    };
    return labels[frequency] || frequency;
  };

  if (loading && recurringExpenses.length === 0) {
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
          Recurring Expenses
        </Typography>
        <Typography color="text.secondary">
          Manage bills and expenses that repeat automatically
        </Typography>
      </Box>

      {/* Expected Monthly Income Section */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)' }}>
        <CardHeader 
          title="Expected Monthly Income" 
          subheader="Set your average expected monthly income for budget tracking"
        />
        <CardContent>
          {!editingIncome ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  ${monthlyIncome ? parseFloat(monthlyIncome).toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setEditingIncome(true)}
              >
                {monthlyIncome ? 'Update' : 'Set'} Income
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                type="number"
                label="Monthly Income"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Enter your expected monthly income"
                inputProps={{ step: '0.01', min: '0' }}
                fullWidth
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSaveMonthlyIncome}
                  sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  Save Income
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditingIncome(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Monthly Impact
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  ${calculateMonthlyImpact().toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {recurringExpenses.length} recurring expenses
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
                  Annual Impact
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  ${calculateAnnualImpact().toFixed(2)}
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
                  Weekly
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>
                  {recurringExpenses.filter(e => e.frequency === 'weekly').length}
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
                  Monthly
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {recurringExpenses.filter(e => e.frequency === 'monthly').length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Form Section */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title={editingId ? 'Edit Recurring Expense' : 'Add New Recurring Expense'} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expense Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rent, Internet, Netflix"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    inputProps={{ step: '0.01', min: '0' }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      label="Frequency"
                    >
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="biweekly">Bi-Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                    >
                      {CATEGORIES.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add notes about this expense"
                    multiline
                    rows={2}
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
                  {editingId ? 'Update Expense' : 'Add Expense'}
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

      {/* Recurring Expenses List */}
      <Card>
        <CardHeader title="Your Recurring Expenses" />
        <CardContent>
          {recurringExpenses.length === 0 ? (
            <Alert severity="info">
              No recurring expenses added yet. Add one above to start tracking!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {recurringExpenses.map((expense) => {
                const monthlyImpact = expense.frequency === 'weekly'
                  ? parseFloat(expense.amount) * 4.33
                  : expense.frequency === 'biweekly'
                  ? parseFloat(expense.amount) * 2.17
                  : parseFloat(expense.amount);

                return (
                  <Grid item xs={12} sm={6} md={4} key={expense.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {expense.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {expense.category}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(expense)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(expense.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Box>

                          <Box sx={{ pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Amount
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                              ${parseFloat(expense.amount).toFixed(2)}
                            </Typography>
                          </Box>

                          <Chip
                            label={getFrequencyLabel(expense.frequency)}
                            size="small"
                            variant="outlined"
                          />

                          <Box sx={{ pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <Typography variant="caption" color="text.secondary">
                              Monthly Impact
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${monthlyImpact.toFixed(2)}/month
                            </Typography>
                          </Box>

                          {expense.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {expense.description}
                            </Typography>
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
        onClose={() => setDeleteDialog({ open: false, expenseId: null })}
      >
        <DialogTitle>Delete Recurring Expense</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this recurring expense? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, expenseId: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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

export default RecurringExpenses;
