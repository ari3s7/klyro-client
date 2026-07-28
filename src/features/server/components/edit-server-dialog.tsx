import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { editServer } from "../api/edit-server";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(3, "Server name must be at least 3 characters."),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  serverId: string;
  serverName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditServerDialog({
  serverId,
  serverName,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: serverName,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ name: serverName });
    }
  }, [open, serverName, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => editServer(serverId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["servers"],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Server</DialogTitle>
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

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-sm bg-cyan-400 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
