export namespace NaoFormInterface {

}

export interface NaoAbstractControlOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}


export namespace NaoMessageNamespace {
  /**
   * Type list
   */
  export const TypeList: Type[] = ["error-message", "info-message", "notification-message"];

  /**
   * Nao message types
   */
  export type Type = 'error-message' | 'info-message' | 'notification-message';

  /**
   * Nao Messages is used for storing extra messages inside a form control based on a pointer
   *
   * @example
   * const naoMessages = {
   *     messages: [
   *         { type: 'error-message', dataPointer: 'data.orderLines', data: { errorType: 'duplicated' }  },
   *         { type: 'error-message', dataPointer: '', data: { errorId: 'duplicated' }  },
   *         { type: 'info-message', dataPointer: 'data.orderLines', data: { text: 'We are using tax avalara' }  },
   *         { type: 'notification-message', dataPointer: 'data.orderLines', data: { }  },
   *     ],
   *     options: {
   *         clearOtherMessages: true
   *     }
   * }
   */
  export interface NaoMessagesInterface {
    messages: NaoMessage[];
    options?: Options;
  }

  /**
   * Nao Message interface base
   */
  interface MessageBase {
    type: Type,
    /**
     * When the data pointer is `null`, 'undefined' or '',
     *      this means we set the data to the current form type (form group, form array, form control)
     */
    dataPointer?: null | string;
    data: {
      errorType?: string,
      errorId?: string,
      text?: string
    }
  }

  /**
   * Type: with all the messages
   */
  export type NaoMessage = MessageBase;

  /**
   * Options: for when you are setting naoMessages
   */
  export interface Options {
    /**
     * When true, we would first clear all other messages from all the form groups and nested levels and then set the messages
     */
    clearOtherMessages: boolean
  }


  /**
   * Group: NaoMessage by data pointer and merge the messages
   *    > Clears: the dataPointer from inside the messages
   */
  export function groupNaoMessagesByDataPointer(messages: NaoMessage[]): GroupedMessagesInterface[] {
    return messages
      .reduce((accumulator: any[], currentValue) => {
        // -->Check: if there is a grouped with the same data pointer
        const index = accumulator.findIndex((data: any) => {
          return data.dataPointer === currentValue.dataPointer;
        });

        if (index !== -1 && accumulator[index] && Array.isArray(accumulator[index]?.messages)) {
          // -->Push: message
          accumulator[index].messages.push(currentValue)
        } else {
          accumulator.push({dataPointer: currentValue.dataPointer, messages: [currentValue]});
        }

        return accumulator;
      }, [])
      // -->Clear: data pointers
      .map(f => {
        // -->Iterate over messages
        f.messages = f.messages.map((el: GroupedMessagesInterface) => {
          delete el.dataPointer;
          return el
        })
        return f;
      });
  }

  /**
   * Interface: for grouped messages
   */
  interface GroupedMessagesInterface {
    dataPointer?: null | string,
    messages: NaoMessageNamespace.NaoMessage[]
  }

}

