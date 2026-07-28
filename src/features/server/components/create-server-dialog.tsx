
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { createServer } from "../api/server-api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(3, "Server name must be at least 3 characters."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateServerDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateServerDialog({
  open,
  setOpen,
}: CreateServerDialogProps) {
 
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
  mutationFn: createServer,

  onSuccess: (data) => {
    console.log("Success:", data);

    queryClient.invalidateQueries({
      queryKey: ["servers"],
    });

    reset();
    setOpen(false);
  },

  onError: (error) => {
    console.error("Error:", error);
  },
});

  const onSubmit = (data: FormValues) => {
  console.log("Submitting:", data);
  mutation.mutate(data);
};

    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Server Name</Label>
            <Input
              placeholder="Server Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Description (optional)"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-sm bg-cyan-400 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}