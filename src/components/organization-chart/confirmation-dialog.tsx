import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    showAction: boolean
    onAction: () => void
  }
  
  export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    showAction,
    onAction,
  }: ConfirmationDialogProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {showAction && <AlertDialogAction onClick={onAction}>Delete</AlertDialogAction>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  
  