import GoogleIcon from '@mui/icons-material/Google'
import { Button, type ButtonProps } from '@mui/material'

interface GoogleSignInButtonProps extends Omit<ButtonProps, 'startIcon' | 'variant'> {
  loading?: boolean
  loadingLabel?: string
  label?: string
}

export function GoogleSignInButton({
  loading = false,
  loadingLabel = 'Entrando...',
  label = 'Continuar com Google',
  disabled,
  color = 'primary',
  size = 'large',
  sx,
  ...props
}: GoogleSignInButtonProps) {
  return (
    <Button
      variant="outlined"
      color={color}
      size={size}
      fullWidth
      startIcon={<GoogleIcon />}
      disabled={disabled || loading}
      sx={{
        py: 1.25,
        ...sx,
      }}
      {...props}
    >
      {loading ? loadingLabel : label}
    </Button>
  )
}
