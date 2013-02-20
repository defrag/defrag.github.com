<?php
	include_once (dirname(dirname(__FILE__)).'/CONFIG.php');
	
	if ((isset($_POST['action'])) && (isset($_POST['widget_id']))) {
		$rating = new Ratings($_POST['widget_id']);
		$rating->get_ratings();
	}
	else {
		$mailer = new PraxisMailer();
		$mailer->run();
	}
	
class Ratings {
		
	private $widget_id;
	private $data;
	private $boxNum;
		
	function __construct($wid) {
		$this->widget_id = $wid;
		$this->data = array('r1' => WIDGET_1, 'r2' => WIDGET_2, 'r3' => WIDGET_3, 'r4' => WIDGET_4, 'r5' => WIDGET_5, 'r6' => WIDGET_6);
	}
		
	public function get_ratings() {
		if(!empty($this->data[$this->widget_id])) {
			$this->boxNum["Box_Num"] = $this->data[$this->widget_id];
			$response = $this->boxNum;
		}
		else {
			$this->boxNum["Box_Num"] = 0;
			$response = $this->boxNum;
		}
		if (isset($response) && !empty($response) && !is_null($response)) {
			echo '{"ResponseData":' . json_encode($response) . '}';
		}	
	}
}
	
class PraxisMailer{
	
    private $_params;
    private $_errors;

    public function __construct(){
        $this->_params = $this->LoadParams();
        $this->_errors = array();
    }

    public function run(){	
        if($this->Validate()){
            $res = $this->SendEmail();
            if($res === true)
                $this->OnSuccess();
            else
                $this->OnError();	
        }else
            $this->OnError();		
    }

    private function LoadParams(){
        return $_POST['contact'];
    }

    private function Validate(){
        if(!(isset($this->_params['name']) && $this->_params['name'] != '' && $this->_params['name'] != 'Name'))
            $this->_errors['name'] = 'empty';
        if(!(isset($this->_params['email']) && $this->_params['email'] != '' && $this->_params['email'] != 'Email'))
            $this->_errors['email'] = 'empty';
        else{
            $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
            if(!preg_match($email_exp,$this->_params['email']))
                $this->_errors['email'] = 'invalid';
        }
        if(!(isset($this->_params['subject']) && $this->_params['subject'] != '' && $this->_params['subject'] != 'Subject'))
            $this->_errors['subject'] = 'empty';
        if(!(isset($this->_params['message']) && $this->_params['message'] != '' && $this->_params['message'] != 'Message'))
            $this->_errors['message'] = 'empty';
        
        return (count($this->_errors) == 0);
    }

    private function SendEmail(){
        $headers = 
            'From: "' . $this->_params['name'] . '" <' . $this->_params['email'] . ">\r\n" .
            'Reply-To: "' . $this->_params['name'] . '" <' . $this->_params['email'] . ">\r\n" .
            'X-Mailer: PHP/' . phpversion();
        
        $to = TO_EMAIL;       
        return mail($to, $this->_params['subject'], $this->_params['message'], $headers);
    }

    private function OnSuccess(){        
        echo '{"success": true}';
    }

    private function OnError(){
        $response = '{';
        $response .= '"success": false, "errors": [';
        
        foreach($this->_errors as $key => $value) {  
            $response .= "{ \"field\": \"$key\", \"error\": \"$value\"},";
        }
        if(count($this->_errors) > 0)
            $response = substr($response, 0, -1);
        $response .= ']}';
		
        echo $response;
    } 
}

?>