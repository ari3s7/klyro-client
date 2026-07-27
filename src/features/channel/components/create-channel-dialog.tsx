import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { createChannel } from "../api/channel-api";

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
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";

const schema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 characters."),
  type: z.enum(["TEXT", "VOICE"]),
});



type FormValues = z.infer<typeof schema>;

interface Props {
  serverId: string;
}

export default function CreateChannelDialog({ serverId }: Props) {

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "TEXT",
    },
  });

  const selectedType = watch("type");

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createChannel(serverId, data),

    onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ["channels", serverId],
  });

  queryClient.invalidateQueries({
    queryKey: ["servers"],
  });

  reset({
    name: "",
    type: "TEXT",
  });
  setOpen(false);
},
    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data)
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button size="icon" className="h-8 w-8 rounded-lg">
          +
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Input
              placeholder="Channel Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Channel Type</Label>

            <RadioGroup
              value={selectedType}
              onValueChange={(value) =>
                setValue("type", value as "TEXT" | "VOICE")
              }
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3">
                <RadioGroupItem value="TEXT" id="text" />
                <Label
                  htmlFor="text"
                  className="cursor-pointer flex flex-col"
                >
                  <span>💬 Text Channel</span>
                  <span className="text-xs text-muted-foreground">
                    Send messages, images and files.
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3">
                <RadioGroupItem value="VOICE" id="voice" />
                <Label
                  htmlFor="voice"
                  className="cursor-pointer flex flex-col"
                >
                  <span>🎤 Voice Channel</span>
                  <span className="text-xs text-muted-foreground">
                    Join voice calls with members.
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {errors.type && (
              <p className="text-sm text-red-500">
                {errors.type.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}