using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace xio.js.spec
{
    public class MultiParamController : ApiController
    {
        [HttpGet]
        public object Get(string param1, string param2, string param3)
        {
            return new
                {
                    param1,
                    param2,
                    param3
                };
        }
    }
}