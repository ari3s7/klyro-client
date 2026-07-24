import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(3, "Server name must be at least 3 characters."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateServerDialog() {
  const [open, setOpen] = useState(false);

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
      <DialogTrigger >
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-zinc-800 hover:bg-green-600"
        >
          +
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Server Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <Textarea
            placeholder="Description (optional)"
            {...register("description")}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}