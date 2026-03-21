import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PORTFOLIO_TYPES } from "@/lib/constants";

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newName: string;
  newType: string;
  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCreate: () => void;
  isCreating: boolean;
}

const CreatePortfolioDialog = ({
  open,
  onOpenChange,
  newName,
  newType,
  onNameChange,
  onTypeChange,
  onCreate,
  isCreating,
}: CreatePortfolioDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Portfolio</DialogTitle>
        <DialogDescription>Add a new portfolio for different purposes.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Portfolio Name</Label>
          <Input
            value={newName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Software Engineer Portfolio"
          />
        </div>
        <div className="space-y-2">
          <Label>Portfolio Type</Label>
          <Select value={newType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PORTFOLIO_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="hero" onClick={onCreate} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Portfolio"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default CreatePortfolioDialog;
