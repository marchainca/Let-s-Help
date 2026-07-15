'use client';

import { Component, ReactNode } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    const { t, children, onRetry } = this.props;

    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              onRetry ? (
                <Button color="inherit" size="small" onClick={onRetry}>
                  {t('dashboard.common.retry')}
                </Button>
              ) : undefined
            }
          >
            {this.state.error?.message || t('dashboard.common.error')}
          </Alert>
        </Box>
      );
    }

    return children;
  }
}

const DashboardErrorBoundary = withTranslation()(DashboardErrorBoundaryBase);
export default DashboardErrorBoundary;
