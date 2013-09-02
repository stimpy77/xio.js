using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace xio.js.spec
{
    public class Sample1Controller : ApiController
    {
        [HttpGet]
        public object Get(string key)
        {
            return new
                {
                    name=key,
                    value=key+"__VALUE"
                };
        }
    }
}