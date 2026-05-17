import { Step, StepLabel, Stepper } from '@mui/material'

interface AuthStepperProps {
  steps: readonly string[]
  activeStep: number
}

export function AuthStepper({ steps, activeStep }: AuthStepperProps) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        px: { xs: 0, sm: 1 },
        '& .MuiStepConnector-root': {
          top: 14,
          left: 'calc(-50% + 20px)',
          right: 'calc(50% + 20px)',
        },
        '& .MuiStepConnector-line': {
          borderTopWidth: 2,
          borderRadius: 1,
        },
        '& .MuiStepLabel-label': {
          mt: 0.75,
          fontSize: '0.8125rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
        },
        '& .MuiStepLabel-label.Mui-active': {
          fontWeight: 600,
        },
        '& .MuiStepLabel-label.Mui-completed': {
          fontWeight: 600,
        },
        '& .MuiStepIcon-root': {
          width: 30,
          height: 30,
          transition: 'transform 0.2s ease, color 0.2s ease',
        },
        '& .MuiStepIcon-root.Mui-active': {
          transform: 'scale(1.06)',
        },
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}
