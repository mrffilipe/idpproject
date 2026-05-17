import GoogleIcon from '@mui/icons-material/Google'
import { Button, type ButtonProps } from '@mui/material'

interface GoogleSignInButtonProps extends Omit<ButtonProps, 'startIcon'> {
  loading?: boolean
  loadingLabel?: string
  label?: string
}

export function GoogleSignInButton({
  loading = false,
  loadingLabel = 'Entrando...',
  label = 'Continuar com Google',
  disabled,
  ...props
}: GoogleSignInButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      startIcon={<GoogleIcon />}
      disabled={disabled || loading}
      sx={{
        py: 1.25,
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
        },
      }}
      {...props}
    >
      {loading ? loadingLabel : label}
    </Button>
  )
}
