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

}

