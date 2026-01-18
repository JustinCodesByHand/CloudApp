import React, { useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  ButtonGroup,
} from '@mui/material';
import { Add as AddIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES, AMOUNT_ADJUSTMENT } from '../constants/transactionConstants';

/**
 * Transaction Form Component - MUI Version
 */
const TransactionForm = ({
  formData,
  activeField,
  onFieldChange,
  onActiveFieldChange,
  onSubmit,
  onImageUploadClick,
}) => {
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (activeField === 'description' && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [activeField]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleAmountAdjust = (delta) => {
    const currentAmount = parseFloat(formData.amount) || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    onFieldChange('amount', newAmount % 1 === 0 ? newAmount : parseFloat(newAmount.toFixed(2)));
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          Add New Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Record your transaction details below
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {/* Description */}
            <TextField
              ref={descriptionRef}
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onFocus={() => onActiveFieldChange('description')}
              placeholder="e.g., Groceries at Whole Foods"
              required
            />

            {/* Date and Amount */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                onFocus={() => onActiveFieldChange('date')}
                InputLabelProps={{ shrink: true }}
                required
              />

              <Box>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onFocus={() => onActiveFieldChange('amount')}
                  inputProps={{ step: '0.01', min: '0' }}
                  required
                  sx={{ mb: 1 }}
                />
                <ButtonGroup size="small" fullWidth variant="outlined">
                  <Button onClick={() => handleAmountAdjust(-AMOUNT_ADJUSTMENT)}>- ${AMOUNT_ADJUSTMENT}</Button>
                  <Button onClick={() => handleAmountAdjust(AMOUNT_ADJUSTMENT)}>+ ${AMOUNT_ADJUSTMENT}</Button>
                </ButtonGroup>
              </Box>
            </Box>

            {/* Category and Type */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onFocus={() => onActiveFieldChange('category')}
                  label="Category"
                >
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  onFocus={() => onActiveFieldChange('type')}
                  label="Type"
                >
                  <MenuItem value={TRANSACTION_TYPES.EXPENSE}>Expense</MenuItem>
                  <MenuItem value={TRANSACTION_TYPES.INCOME}>Income</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                Add Transaction
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<CameraAltIcon />}
                onClick={onImageUploadClick}
              >
                Scan Receipt
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
